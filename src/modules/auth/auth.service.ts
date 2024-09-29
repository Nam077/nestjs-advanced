import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';

import { Details } from 'express-useragent';
import { I18nService, I18nContext } from 'nestjs-i18n';

import { JwtServiceLocal } from './jwt.service';
import { UserService } from '../user/user.service';
import { LoginDto } from './dtos/login.dto';
import {
    AccessToken,
    convertTimeStampToSeconds,
    GeoIpI,
    JwtPayload,
    JwtResponse,
    KeyType,
    RefreshToken,
    SESSION_KEY,
    UserAuth,
    UserStatus,
} from '../../common';
import { RedisService } from '../cache/cache.service';
import { RegisterDto } from './dtos/register.dto';
import { ResendEmailDto } from './dtos/resend-email.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { SendRestPasswordDto } from './dtos/send-reset-password.dto';
import { I18nTranslations } from '../i18n/i18n.generated';
import { EmailAuthProducerService } from '../message-queue-module/producers/email-auth-producer.service';
import { User } from '../user/entities/user.entity';

const MESSAGE_INVALID_CREDENTIALS = 'Invalid credentials';

export type TypeSendEmail = 'confirm' | 'reset';
export interface UserData {
    ip: string;
    userAgent: string;
    userId: string;
    email: string;
    os: string;
    browser: string;
    jwtId: string;
    sessionId?: string;
}

export interface LoginResponse {
    data: {
        accessToken: Omit<AccessToken, 'jwtId'>;
        refreshToken: Omit<RefreshToken, 'jwtId' | 'sessionId'>;
        user: User;
    };
    message: string;
}

export interface RegisterResponse {
    message: string;
    user: User;
}

export interface MessageResponse {
    message: string;
}

/**
 * @class AuthService - Handles authentication logic.
 */
@Injectable()
export class AuthService {
    /**
     *
     * @param {JwtServiceLocal} jwtService - The JWT service.
     * @param {UserService} userService - The user service.
     * @param {RedisService} cacheService - The cache service.
     * @param {EmailAuthProducerService} emailAuthProducerService - The email producer service.
     * @param {I18nService<I18nTranslations>} i18nService - The i18n service.
     */
    constructor(
        private readonly jwtService: JwtServiceLocal,
        private readonly userService: UserService,
        private readonly cacheService: RedisService,
        private readonly emailAuthProducerService: EmailAuthProducerService,
        private readonly i18nService: I18nService<I18nTranslations>,
    ) {}

    /**
     * Generates a Redis key for storing sessions related to a user.
     * @param {string} userId - The user ID.
     * @returns {string} Redis key.
     */
    private getUserSessionsKey(userId: string): string {
        return `${SESSION_KEY}:user:${userId}`;
    }

    /**
     * Generates a Redis key for a specific session.
     * @param {string} sessionId - The session ID.
     * @returns {string} Redis key.
     */
    private getSessionKey(sessionId: string): string {
        return `${SESSION_KEY}:${sessionId}`;
    }

    /**
     * Helper function to store session in Redis.
     * @param {UserData} userData - The user data to store.
     * @param {RefreshToken} refreshToken - The refresh token.
     */
    private async storeSession(userData: UserData, refreshToken: RefreshToken) {
        const sessionKey = this.getSessionKey(refreshToken.sessionId);
        const userSessionsKey = this.getUserSessionsKey(userData.userId);

        await this.cacheService.set(sessionKey, userData, convertTimeStampToSeconds(refreshToken.exp));
        await this.cacheService.sadd(userSessionsKey, refreshToken.sessionId);
    }

    /**
     * Helper function to send email.
     * @param {User} user - The user entity.
     * @param {string} token - The token to include in email.
     * @param {string} type - Type of email to send ('confirm', 'reset').
     */
    private async sendEmail(user: User, token: string, type: TypeSendEmail) {
        let baseUrl: string;

        switch (type) {
            case 'confirm':
                baseUrl = 'http://localhost:3000/auth/verify-email';
                break;
            case 'reset':
                baseUrl = 'http://localhost:3000/auth/reset-password';
                break;
            default:
                throw new Error('Invalid email type');
        }

        const url = `${baseUrl}?token=${token}`;

        switch (type) {
            case 'confirm':
                await this.emailAuthProducerService.sendConfirmationEmail({
                    user: { email: user.email, name: user.name, verifyUrl: url },
                });
                break;
            case 'reset':
                await this.emailAuthProducerService.sendResetPasswordEmail({
                    user: { email: user.email, name: user.name, resetUrl: url },
                });
                break;
            default:
                throw new Error('Invalid email type');
        }
    }

    /**
     * Validates a user from JWT payload.
     * @param {JwtPayload} payload - JWT payload.
     * @returns {Promise<User>} - The validated user.
     */
    async validateUser(payload: JwtPayload): Promise<User> {
        return this.userService.findByEmailAndId(payload.email, payload.sub);
    }

    /**
     * Handles user login and JWT token generation.
     * @param {LoginDto} loginDto - Login credentials.
     * @param {Details} ua - User agent data.
     * @param {GeoIpI} ipGeo - Geo IP data.
     * @returns {Promise<LoginResponse>} - JWT tokens and user details.
     * @throws {UnauthorizedException} - If credentials are invalid.
     */
    async login(loginDto: LoginDto, ua: Details, ipGeo: GeoIpI): Promise<LoginResponse> {
        const { email, password } = loginDto;
        const user = await this.userService.findByEmail(email);

        if (!user || !user.comparePassword(password)) {
            throw new UnauthorizedException(MESSAGE_INVALID_CREDENTIALS);
        }

        const tokens = await this.jwtService.signTokens({ email: user.email, sub: user.id, name: user.name });

        const userData: UserData = {
            ip: ipGeo.ip,
            userAgent: ua.source,
            userId: user.id,
            email: user.email,
            os: ua.os,
            browser: ua.browser,
            jwtId: tokens.refreshToken.jwtId,
            sessionId: tokens.refreshToken.sessionId,
        };

        await this.storeSession(userData, tokens.refreshToken);
        delete user.password;

        return {
            data: {
                accessToken: { token: tokens.accessToken.token, exp: tokens.accessToken.exp },
                refreshToken: { token: tokens.refreshToken.token, exp: tokens.refreshToken.exp },
                user,
            },
            message: this.i18nService.translate('auth.messages.loginSuccess', { lang: I18nContext.current().lang }),
        };
    }

    /**
     * Registers a new user and sends confirmation email.
     * @param {RegisterDto} registerDto - Registration data.
     * @returns {Promise<RegisterResponse>} - The registered user details.
     * @throws {BadRequestException} - If registration fails.
     */
    async register(registerDto: RegisterDto): Promise<RegisterResponse> {
        const user = await this.userService.register(registerDto);

        if (!user) {
            throw new BadRequestException(
                this.i18nService.translate('auth.exceptions.registrationFailed', { lang: I18nContext.current().lang }),
            );
        }

        const token = await this.jwtService.signConfirmationUserToken({
            email: user.email,
            sub: user.id,
            name: user.name,
        });

        await this.sendEmail(user, token.token, 'confirm');

        return {
            message: this.i18nService.translate('auth.messages.registerSuccess', {
                lang: I18nContext.current().lang,
                args: { email: user.email },
            }),
            user,
        };
    }

    /**
     * Refreshes JWT tokens for the current session.
     * @param {UserAuth} currentUser - The current authenticated user.
     * @returns {Promise<JwtResponse>} - New JWT tokens.
     * @throws {UnauthorizedException} - If session is invalid or expired.
     */
    async refresh(currentUser: UserAuth): Promise<JwtResponse> {
        const sessionKey = this.getSessionKey(currentUser.sessionId);
        const userData = await this.cacheService.get<UserData>(sessionKey);

        if (!userData) {
            throw new UnauthorizedException(
                this.i18nService.translate('auth.exceptions.sessionExpired', { lang: I18nContext.current().lang }),
            );
        }

        const tokens = await this.jwtService.signTokens({
            email: currentUser.email,
            sub: currentUser.id,
            name: currentUser.name,
            sessionId: currentUser.sessionId,
        });

        userData.jwtId = tokens.refreshToken.jwtId;
        await this.cacheService.update(sessionKey, userData, convertTimeStampToSeconds(tokens.refreshToken.exp));

        return {
            accessToken: {
                token: tokens.accessToken.token,
                exp: tokens.accessToken.exp,
                jwtId: tokens.accessToken.jwtId,
            },
            refreshToken: {
                token: tokens.refreshToken.token,
                exp: tokens.refreshToken.exp,
                jwtId: tokens.refreshToken.jwtId,
                sessionId: tokens.refreshToken.sessionId,
            },
        };
    }

    /**
     * Validates a refresh token.
     * @param {string} userId - The user ID.
     * @param {string} refreshToken - The refresh token.
     * @returns {Promise<UserAuth>} - The validated user.
     * @throws {UnauthorizedException} - If validation fails.
     */
    async validateRefreshToken(userId: string, refreshToken: string): Promise<UserAuth> {
        const decoded = this.jwtService.decode(refreshToken, false) as JwtPayload;

        if (!decoded) throw new UnauthorizedException(MESSAGE_INVALID_CREDENTIALS);

        const sessionKey = this.getSessionKey(decoded.sessionId);
        const userSessionsKey = this.getUserSessionsKey(userId);
        const isMember = await this.cacheService.sismember(userSessionsKey, decoded.sessionId);
        const userData = await this.cacheService.get<UserData>(sessionKey);

        if (!isMember || !userData || userData.jwtId !== decoded.jti) {
            throw new UnauthorizedException(MESSAGE_INVALID_CREDENTIALS);
        }

        const user = await this.userService.findByEmailAndId(decoded.email, userId);

        return { ...user, sessionId: decoded.sessionId };
    }

    /**
     * Logs out a specific session.
     * @param {UserAuth} currentUser - The current authenticated user.
     * @param {string} refreshToken - The refresh token.
     * @returns {Promise<{ message: string }>} - Logout success message.
     */
    async logout(currentUser: UserAuth, refreshToken: string): Promise<{ message: string }> {
        const decoded = this.jwtService.decode(refreshToken) as JwtPayload;
        const sessionKey = this.getSessionKey(decoded.sessionId);
        const userSessionsKey = this.getUserSessionsKey(currentUser.id);

        await this.cacheService.srem(userSessionsKey, decoded.sessionId);
        await this.cacheService.del(sessionKey);

        return {
            message: this.i18nService.translate('auth.messages.logoutSuccess', { lang: I18nContext.current().lang }),
        };
    }

    /**
     * Logs out all sessions for a user.
     * @param {string} userId - The user ID.
     * @param {string[]} sessionIds - Optional specific session IDs to log out.
     * @returns {Promise<void>}
     */
    async logoutAllSessions(userId: string, sessionIds: string[] = []): Promise<void> {
        const userSessionsKey = this.getUserSessionsKey(userId);

        sessionIds = sessionIds.length ? sessionIds : await this.cacheService.smembers(userSessionsKey);
        if (!sessionIds.length) return;

        const pipeline = this.cacheService.pipeline();

        sessionIds.forEach((sessionId) => {
            const sessionKey = this.getSessionKey(sessionId);

            pipeline.del(sessionKey);
            pipeline.srem(userSessionsKey, sessionId);
        });

        await pipeline.exec();

        if (!(await this.cacheService.smembers(userSessionsKey)).length) {
            await this.cacheService.del(userSessionsKey);
        }
    }

    /**
     * Logs out all sessions for the current user.
     * @param {UserAuth} currentUser - The current authenticated user.
     * @returns {Promise<{ message: string }>} - Success message after logging out.
     */
    async logoutAll(currentUser: UserAuth): Promise<{ message: string }> {
        await this.logoutAllSessions(currentUser.id);

        return {
            message: this.i18nService.translate('auth.messages.allSessionsLoggedOut', {
                lang: I18nContext.current().lang,
            }),
        };
    }

    /**
     * Verifies user email and logs in after verification.
     * @param {string} token - The verification token.
     * @param {Details} ua - User agent data.
     * @param {GeoIpI} ipGeo - Geo IP data.
     * @returns {Promise<LoginResponse>} - Success response with JWT tokens.
     * @throws {UnauthorizedException} - If verification fails.
     */
    async verifyEmail(token: string, ua: Details, ipGeo: GeoIpI): Promise<LoginResponse> {
        const { isValid, payload } = await this.jwtService.verify<JwtPayload>(token, KeyType.CONFIRMATION_USER_KEY);

        if (!isValid)
            throw new UnauthorizedException(
                this.i18nService.translate('auth.exceptions.invalidCredentials', { lang: I18nContext.current().lang }),
            );

        const user = await this.userService.verifyEmail(payload.sub);

        if (!user)
            throw new UnauthorizedException(
                this.i18nService.translate('auth.exceptions.invalidCredentials', { lang: I18nContext.current().lang }),
            );

        const tokens = await this.jwtService.signTokens({ email: user.email, sub: user.id, name: user.name });

        const userData: UserData = {
            ip: ipGeo.ip,
            userAgent: ua.source,
            userId: user.id,
            email: user.email,
            os: ua.os,
            browser: ua.browser,
            jwtId: tokens.refreshToken.jwtId,
            sessionId: tokens.refreshToken.sessionId,
        };

        await this.storeSession(userData, tokens.refreshToken);
        delete user.password;

        return {
            data: {
                accessToken: { token: tokens.accessToken.token, exp: tokens.accessToken.exp },
                refreshToken: { token: tokens.refreshToken.token, exp: tokens.refreshToken.exp },
                user,
            },
            message: this.i18nService.translate('auth.messages.emailVerified', { lang: I18nContext.current().lang }),
        };
    }

    /**
     * Resets user's password and logs them in.
     * @param {string} token - The reset token.
     * @param {ResetPasswordDto} resetPasswordDto - New password data.
     * @param {Details} ua - User agent data.
     * @param {GeoIpI} ipGeo - Geo IP data.
     * @returns {Promise<LoginResponse>} - Success response with JWT tokens.
     * @throws {UnauthorizedException} - If reset token is invalid.
     */
    async resetPassword(
        token: string,
        resetPasswordDto: ResetPasswordDto,
        ua: Details,
        ipGeo: GeoIpI,
    ): Promise<LoginResponse> {
        const { isValid, payload } = await this.jwtService.verify<JwtPayload>(token, KeyType.RESET_PASSWORD_KEY);

        if (!isValid) throw new UnauthorizedException(MESSAGE_INVALID_CREDENTIALS);

        const user = await this.userService.resetPassword(payload.sub, resetPasswordDto.password);

        if (!user) throw new UnauthorizedException(MESSAGE_INVALID_CREDENTIALS);

        const tokens = await this.jwtService.signTokens({ email: user.email, sub: user.id, name: user.name });

        const userData: UserData = {
            ip: ipGeo.ip,
            userAgent: ua.source,
            userId: user.id,
            email: user.email,
            os: ua.os,
            browser: ua.browser,
            jwtId: tokens.refreshToken.jwtId,
            sessionId: tokens.refreshToken.sessionId,
        };

        await this.storeSession(userData, tokens.refreshToken);
        delete user.password;

        return {
            data: {
                accessToken: { token: tokens.accessToken.token, exp: tokens.accessToken.exp },
                refreshToken: { token: tokens.refreshToken.token, exp: tokens.refreshToken.exp },
                user,
            },
            message: this.i18nService.translate('auth.messages.passwordResetSuccess', {
                lang: I18nContext.current().lang,
            }),
        };
    }

    /**
     * Resends verification email.
     * @param {ResendEmailDto} resendEmailDto - Data containing the email to resend verification to.
     * @returns {Promise<MessageResponse>} - Success message.
     * @throws {BadRequestException} - If user is already verified or blocked.
     */
    async resendVerificationEmail(resendEmailDto: ResendEmailDto): Promise<MessageResponse> {
        const user = await this.userService.findByEmail(resendEmailDto.email);

        if (!user || user.status === UserStatus.ACTIVE) {
            throw new BadRequestException(
                this.i18nService.translate('auth.exceptions.userAlreadyVerified', { lang: I18nContext.current().lang }),
            );
        }

        if (user.status === UserStatus.BLOCKED) {
            throw new BadRequestException(
                this.i18nService.translate('auth.exceptions.userBlocked', { lang: I18nContext.current().lang }),
            );
        }

        const token = await this.jwtService.signConfirmationUserToken({
            email: user.email,
            sub: user.id,
            name: user.name,
        });

        await this.sendEmail(user, token.token, 'confirm');

        return {
            message: this.i18nService.translate('auth.messages.verificationEmailSent', {
                lang: I18nContext.current().lang,
            }),
        };
    }

    /**
     * Sends reset password email.
     * @param {SendRestPasswordDto} sendResetPasswordDto - Data containing the email to send reset link to.
     * @returns {Promise<MessageResponse>} - Success message.
     * @throws {NotFoundException} - If user is not found.
     */
    async sendResetPassword(sendResetPasswordDto: SendRestPasswordDto): Promise<MessageResponse> {
        const user = await this.userService.findByEmail(sendResetPasswordDto.email);

        if (!user)
            throw new NotFoundException(
                this.i18nService.translate('auth.exceptions.userNotFound', { lang: I18nContext.current().lang }),
            );

        const token = await this.jwtService.signResetPasswordUserToken({
            email: user.email,
            sub: user.id,
            name: user.name,
        });

        await this.sendEmail(user, token.token, 'reset');

        return {
            message: this.i18nService.translate('auth.messages.resetPasswordEmailSent', {
                lang: I18nContext.current().lang,
            }),
        };
    }

    /**
     * Gets all active sessions for a user.
     * @param {string} userId - The user ID.
     * @returns {Promise<UserData[]>} - The list of user sessions.
     */
    async getUserSessions(userId: string): Promise<UserData[]> {
        const userSessionsKey = this.getUserSessionsKey(userId);
        const sessionIds = await this.cacheService.smembers(userSessionsKey);

        if (!sessionIds.length) {
            return [];
        }

        const pipeline = this.cacheService.pipeline();

        sessionIds.forEach((sessionId) => {
            const sessionKey = this.getSessionKey(sessionId);

            pipeline.get(sessionKey);
        });

        const sessionResults = await pipeline.exec();

        return sessionResults.map((result: string[]) => JSON.parse(result[1])); // Convert results to UserData[]
    }

    /**
     * Logs out specific sessions for a user.
     * @param {string} userId - The user ID.
     * @param {string[]} sessionIds - The session IDs to log out.
     * @returns {Promise<{ message: string }>} - Success message.
     */
    async logoutSessions(userId: string, sessionIds: string[]): Promise<{ message: string }> {
        await this.logoutAllSessions(userId, sessionIds);

        return {
            message: this.i18nService.translate('auth.messages.sessionLoggedOut', {
                lang: I18nContext.current().lang,
            }),
        };
    }
}
