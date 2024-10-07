/* eslint-disable sonarjs/no-duplicate-string */
import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';

import { Details } from 'express-useragent';
import { I18nContext, I18nService } from 'nestjs-i18n';

import {
    GeoIpI,
    JwtPayload,
    JwtResponse,
    KeyType,
    LoginResponse,
    MessageResponse,
    RegisterResponse,
    TypeSendEmail,
    UserAuth,
    UserStatus,
} from '@/common';
import { RedisService } from '@cache/cache.service';
import { I18nPath, I18nTranslations } from '@i18n/i18n.generated';
import { LoginDto } from '@modules/auth/dtos/login.dto';
import { RegisterDto } from '@modules/auth/dtos/register.dto';
import { ResendEmailDto } from '@modules/auth/dtos/resend-email.dto';
import { ResetPasswordDto } from '@modules/auth/dtos/reset-password.dto';
import { SendRestPasswordDto } from '@modules/auth/dtos/send-reset-password.dto';
import { JwtServiceLocal } from '@modules/auth/jwt.service';
import { SessionService, UserData } from '@modules/auth/session.service';
import { User } from '@modules/user/entities/user.entity';
import { UserService } from '@modules/user/user.service';
import { EmailAuthProducerService } from '@producers/email-auth-producer.service';

/**
 *
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
     * @param {SessionService} sessionService - The session service.
     */
    constructor(
        private readonly jwtService: JwtServiceLocal,
        private readonly userService: UserService,
        private readonly cacheService: RedisService,
        private readonly emailAuthProducerService: EmailAuthProducerService,
        private readonly i18nService: I18nService<I18nTranslations>,
        private readonly sessionService: SessionService,
    ) {}

    /**
     *
     * @param {I18nPath} key - The i18n key.}
     * @param {Record<string, unknown>} args - The arguments to pass to the translation.
     * @returns {string} - The translated message.
     */
    translateMessage(key: I18nPath, args?: Record<string, unknown>): string {
        return this.i18nService.translate(key, { lang: I18nContext.current().lang, args });
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
     *
     * @param {GeoIpI} ipGeo - The Geo IP data.
     * @param {Details} ua - The user agent data.
     * @param {User} user - The user entity.
     * @param {JwtResponse} jwtResponse - The JWT tokens.
     * @returns {UserData} - The user data to store in Redis.
     */
    createUserData(ipGeo: GeoIpI, ua: Details, user: User, jwtResponse: JwtResponse): UserData {
        return {
            ip: ipGeo.ip,
            userAgent: ua.source,
            userId: user.id,
            email: user.email,
            os: ua.os,
            browser: ua.browser,
            jwtAccessId: jwtResponse.accessToken.jwtId,
            expAcc: jwtResponse.accessToken.exp,
            jwtRefreshId: jwtResponse.refreshToken.jwtId,
            expRef: jwtResponse.refreshToken.exp,
            sessionId: jwtResponse.refreshToken.sessionId,
        };
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
            throw new UnauthorizedException(this.translateMessage('auth.exceptions.invalidCredentials'));
        }

        const tokens = await this.jwtService.signTokens({ email: user.email, sub: user.id, name: user.name });

        const userData = this.createUserData(ipGeo, ua, user, tokens);

        await this.sessionService.createNewSession(userData, tokens.refreshToken, tokens.accessToken);
        delete user.password;

        return {
            data: {
                accessToken: { token: tokens.accessToken.token, exp: tokens.accessToken.exp },
                refreshToken: { token: tokens.refreshToken.token, exp: tokens.refreshToken.exp },
                user,
            },
            message: this.translateMessage('auth.messages.loginSuccess'),
        };
    }

    /**
     * Registers a new user and sends confirmation email.
     * @param {RegisterDto} registerDto - Registration data.
     * @returns {Promise<RegisterResponse>} - The registered user details.
     * @throws {BadRequestException} - If registration fails.
     */
    async register(registerDto: RegisterDto): Promise<RegisterResponse> {
        const user: User = await this.userService.register(registerDto);

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
            message: this.translateMessage('auth.messages.registerSuccess', { email: user.email }),
            user,
        };
    }

    /**
     * Refreshes JWT tokens for the current session.
     * @param {UserAuth} currentUser - The current authenticated user.
     * @returns {Promise<JwtResponse>} - New JWT tokens.
     * @throws {UnauthorizedException} - If session is invalid or expired.
     */
    async refresh(currentUser: UserAuth): Promise<LoginResponse> {
        const userData = await this.sessionService.getUserSession(currentUser.sessionId);

        if (!userData) {
            throw new UnauthorizedException(this.translateMessage('auth.exceptions.sessionExpired'));
        }

        const tokens = await this.jwtService.signTokens({
            email: currentUser.email,
            sub: currentUser.id,
            name: currentUser.name,
            sessionId: currentUser.sessionId,
        });

        await this.sessionService.updateSessionAndAddToWhitelist(userData, tokens.refreshToken, tokens.accessToken);

        return {
            data: {
                accessToken: { token: tokens.accessToken.token, exp: tokens.accessToken.exp },
                refreshToken: { token: tokens.refreshToken.token, exp: tokens.refreshToken.exp },
            },
            message: this.translateMessage('auth.messages.refreshSuccess'),
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

        if (!decoded) throw new UnauthorizedException(this.translateMessage('auth.exceptions.invalidCredentials'));

        const isValid = await this.sessionService.validateSession(decoded.sessionId, userId);

        if (!isValid) {
            throw new UnauthorizedException(this.translateMessage('auth.exceptions.sessionExpired'));
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
        const decoded = this.jwtService.decode(refreshToken, false) as JwtPayload;

        await this.sessionService.removeSession(decoded.sessionId);

        return {
            message: this.translateMessage('auth.messages.logoutSuccess'),
        };
    }

    /**
     * Logs out all sessions for the current user.
     * @param {UserAuth} currentUser - The current authenticated user.
     * @returns {Promise<{ message: string }>} - Success message after logging out.
     */
    async logoutAll(currentUser: UserAuth): Promise<{ message: string }> {
        await this.sessionService.removeAllSessions(currentUser.id);

        return {
            message: this.translateMessage('auth.messages.allSessionsLoggedOut'),
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

        if (!isValid) throw new UnauthorizedException(this.translateMessage('auth.exceptions.invalidCredentials'));

        const user = await this.userService.verifyEmail(payload.sub);

        if (!user) throw new UnauthorizedException(this.translateMessage('auth.exceptions.invalidCredentials'));

        const tokens = await this.jwtService.signTokens({ email: user.email, sub: user.id, name: user.name });

        const userData = this.createUserData(ipGeo, ua, user, tokens);

        await this.sessionService.createNewSession(userData, tokens.refreshToken, tokens.accessToken);
        delete user.password;

        return {
            data: {
                accessToken: { token: tokens.accessToken.token, exp: tokens.accessToken.exp },
                refreshToken: { token: tokens.refreshToken.token, exp: tokens.refreshToken.exp },
                user,
            },
            message: this.translateMessage('auth.messages.emailVerified'),
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

        if (!isValid) throw new UnauthorizedException(this.translateMessage('auth.exceptions.invalidCredentials'));

        const user = await this.userService.resetPassword(payload.sub, resetPasswordDto.password);

        if (!user) throw new UnauthorizedException(this.translateMessage('auth.exceptions.invalidCredentials'));

        const tokens = await this.jwtService.signTokens({ email: user.email, sub: user.id, name: user.name });

        const userData = this.createUserData(ipGeo, ua, user, tokens);

        await this.sessionService.createNewSession(userData, tokens.refreshToken, tokens.accessToken);
        delete user.password;

        return {
            data: {
                accessToken: { token: tokens.accessToken.token, exp: tokens.accessToken.exp },
                refreshToken: { token: tokens.refreshToken.token, exp: tokens.refreshToken.exp },
                user,
            },
            message: this.translateMessage('auth.messages.passwordResetSuccess'),
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
            throw new BadRequestException(this.translateMessage('auth.exceptions.userAlreadyVerified'));
        }

        if (user.status === UserStatus.BLOCKED) {
            throw new BadRequestException(this.translateMessage('auth.exceptions.userBlocked'));
        }

        const token = await this.jwtService.signConfirmationUserToken({
            email: user.email,
            sub: user.id,
            name: user.name,
        });

        await this.sendEmail(user, token.token, 'confirm');

        return {
            message: this.translateMessage('auth.messages.verificationEmailSent'),
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

        if (!user) throw new NotFoundException(this.translateMessage('auth.exceptions.userNotFound'));

        const token = await this.jwtService.signResetPasswordUserToken({
            email: user.email,
            sub: user.id,
            name: user.name,
        });

        await this.sendEmail(user, token.token, 'reset');

        return {
            message: this.translateMessage('auth.messages.resetPasswordEmailSent'),
        };
    }

    /**
     * Gets all active sessions for a user.
     * @param {string} userId - The user ID.
     * @returns {Promise<UserData[]>} - The list of user sessions.
     */
    async getUserSessions(userId: string): Promise<UserData[]> {
        return await this.sessionService.getAllSessions(userId);
    }

    /**
     * Logs out specific sessions for a user.
     * @param {string} userId - The user ID.
     * @param {string[]} sessionIds - The session IDs to log out.
     * @returns {Promise<{ message: string }>} - Success message.
     */
    async logoutSessions(userId: string, sessionIds: string[]): Promise<{ message: string }> {
        await this.sessionService.removeAllSessions(userId, sessionIds);

        return {
            message: this.translateMessage('auth.messages.sessionLoggedOut'),
        };
    }
}
