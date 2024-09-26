import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';

import { Details } from 'express-useragent';
import { get } from 'lodash';

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
import { EmailAuthProducerService } from '../message-queue-module/producers/email-auth-producer.service';
import { User } from '../user/entities/user.entity';

const MESSAGE_INVALID_CREDENTIALS = 'Invalid credentials';

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

/**
 * @class AuthService - The service for authentication
 */
@Injectable()
export class AuthService {
    /**
     *
     * @param {JwtServiceLocal} jwtService - The JWT service
     * @param {UserService} userService - The user service
     * @param {RedisService} cacheService - The cache service
     * @param {EmailAuthProducerService} emailAuthProducerService - The email auth producer service
     */
    constructor(
        private readonly jwtService: JwtServiceLocal,
        private readonly userService: UserService,
        private readonly cacheService: RedisService,
        private readonly emailAuthProducerService: EmailAuthProducerService,
    ) {}

    // Tạo key để lưu trữ danh sách session theo user
    /**
     *
     * @param {string} userId - The user ID
     * @returns {string} The user sessions key
     */
    private getUserSessionsKey(userId: string): string {
        return `${SESSION_KEY}:user:${userId}`;
    }

    // Tạo key session cụ thể
    /**
     *
     * @param {string} sessionId - The session ID
     * @returns {string} The session key
     */
    private getSessionKey(sessionId: string): string {
        return `${SESSION_KEY}:${sessionId}`;
    }

    /**
     *
     * @param {JwtPayload} payload - The payload
     * @returns {Promise<User>} The user entity
     * @throws {UnauthorizedException} The unauthorized exception
     */
    async validateUser(payload: JwtPayload): Promise<User> {
        return this.userService.findByEmailAndId(payload.email, payload.sub);
    }

    /**
     * Login a user
     * @param {LoginDto} loginDto - The login data
     * @param {Details} ua - The user agent data
     * @param {GeoIpI} ipGeo - The geo IP data
     * @returns {Promise<LoginResponse>} The JWT response
     */
    async login(loginDto: LoginDto, ua: Details, ipGeo: GeoIpI): Promise<LoginResponse> {
        const { email, password } = loginDto;
        const user = await this.userService.findByEmail(email);

        if (!user) {
            throw new UnauthorizedException(MESSAGE_INVALID_CREDENTIALS);
        }

        const isValid = user.comparePassword(password);

        if (!isValid) {
            throw new UnauthorizedException(MESSAGE_INVALID_CREDENTIALS);
        }

        const data = await this.jwtService.signTokens({
            email: user.email,
            sub: user.id,
            name: user.name,
        });

        const sessionKey = this.getSessionKey(data.refreshToken.sessionId);
        const userSessionsKey = this.getUserSessionsKey(user.id);

        const userData: UserData = {
            ip: ipGeo.ip,
            userAgent: ua.source,
            userId: user.id,
            email: user.email,
            os: ua.os,
            browser: ua.browser,
            jwtId: data.refreshToken.jwtId,
            sessionId: data.refreshToken.sessionId,
        };

        await this.cacheService.set(sessionKey, userData, convertTimeStampToSeconds(data.refreshToken.exp));
        await this.cacheService.sadd(userSessionsKey, data.refreshToken.sessionId);

        delete user.password;

        return {
            data: {
                accessToken: {
                    token: data.accessToken.token,
                    exp: data.accessToken.exp,
                },
                refreshToken: {
                    token: data.refreshToken.token,
                    exp: data.refreshToken.exp,
                },
                user,
            },
            message: 'Login successful',
        };
    }

    /**
     *
     * @param {User} user - The user entity
     * @returns {Promise<void>} The response
     */
    async sendConfirmationEmail(user: User): Promise<void> {
        const token = await this.jwtService.signConfirmationUserToken({
            email: user.email,
            sub: user.id,
            name: user.name,
        });

        const verifyUrl = `http://localhost:3000/auth/verify-email?token=${token.token}`;

        await this.emailAuthProducerService.sendConfirmationEmail({
            user: {
                email: user.email,
                name: user.name,
                verifyUrl: verifyUrl,
            },
        });
    }

    /**
     *
     * @param {RegisterDto} registerDto - The register data
     * @returns {Promise<RegisterResponse>} The response
     */
    async register(registerDto: RegisterDto): Promise<RegisterResponse> {
        const user = await this.userService.register(registerDto);

        if (!user) {
            throw new BadRequestException('Hmmm, something went wrong. Please try again.');
        }

        await this.sendConfirmationEmail(user);

        return {
            message: `User ${user.email} registered successfully. Please check your email to verify your account.`,
            user,
        };
    }

    /**
     * Refresh tokens for the current user session
     * @param {UserAuth} currentUser - The current user
     * @returns {Promise<JwtResponse>} - The new JWT response
     * @throws {UnauthorizedException} - If the session is invalid
     */
    async refresh(currentUser: UserAuth): Promise<JwtResponse> {
        const sessionKey = this.getSessionKey(currentUser.sessionId);

        const userData = await this.cacheService.get<UserData>(sessionKey);

        if (!userData) {
            throw new UnauthorizedException('Invalid session or session expired');
        }

        const data = await this.jwtService.signTokens({
            email: currentUser.email,
            sub: currentUser.id,
            name: currentUser.name,
            sessionId: currentUser.sessionId,
        });

        userData.jwtId = data.refreshToken.jwtId;

        await this.cacheService.update(sessionKey, userData, convertTimeStampToSeconds(data.refreshToken.exp));

        return {
            accessToken: {
                token: data.accessToken.token,
                exp: data.accessToken.exp,
                jwtId: data.accessToken.jwtId,
            },
            refreshToken: {
                token: data.refreshToken.token,
                exp: data.refreshToken.exp,
                jwtId: data.refreshToken.jwtId,
                sessionId: data.refreshToken.sessionId,
            },
        };
    }

    /**
     * @param {string} userId - The user ID
     * @param {string} refreshToken - The refresh token
     * @returns {Promise<UserAuth>} The user entity
     */
    async validateRefreshToken(userId: string, refreshToken: string): Promise<UserAuth> {
        const decodeData = this.jwtService.decode(refreshToken) as JwtPayload;

        if (!decodeData) {
            throw new UnauthorizedException(MESSAGE_INVALID_CREDENTIALS);
        }

        const sessionKey = this.getSessionKey(decodeData.sessionId);
        const userSessionsKey = this.getUserSessionsKey(userId);

        const isMember = await this.cacheService.sismember(userSessionsKey, decodeData.sessionId);

        if (!isMember) {
            throw new UnauthorizedException(MESSAGE_INVALID_CREDENTIALS);
        }

        const userData = await this.cacheService.get<UserData>(sessionKey);

        if (!userData || userData.jwtId !== decodeData.jti) {
            throw new UnauthorizedException(MESSAGE_INVALID_CREDENTIALS);
        }

        const user = await this.userService.findByEmailAndId(decodeData.email, userId);

        return {
            ...user,
            sessionId: decodeData.sessionId,
        };
    }

    /**
     * @param {UserAuth} currentUser - The current user
     * @param {string} refreshToken - The refresh token
     * @returns {Promise<{ message: string }>} The response
     */
    async logout(currentUser: UserAuth, refreshToken: string): Promise<{ message: string }> {
        const decodeData = this.jwtService.decode(refreshToken) as JwtPayload;
        const sessionKey = this.getSessionKey(decodeData.sessionId);
        const userSessionsKey = this.getUserSessionsKey(currentUser.id);

        await this.cacheService.srem(userSessionsKey, decodeData.sessionId);
        await this.cacheService.del(sessionKey);

        return {
            message: 'Logout successful',
        };
    }

    /**
     *
     * @param {string} userId - The user ID
     * @returns {Promise<UserData[]>} The user sessions
     */
    async getAllSessionsForUser(userId: string): Promise<UserData[]> {
        const userSessionsKey = `session:user:${userId}`;

        const sessionIds = await this.cacheService.smembers(userSessionsKey);

        if (sessionIds.length === 0) {
            return [];
        }

        const pipeline = this.cacheService.pipeline();

        sessionIds.forEach((sessionId) => {
            const sessionKey = `session:${sessionId}`;

            pipeline.get(sessionKey);
        });

        const sessionResults = await pipeline.exec();

        return sessionResults.map((result: string[]) => JSON.parse(result[1]));
    }

    /**
     *
     * @param {string} userId - The user ID
     * @returns {Promise<any>} The user sessions
     */
    async getUserSessions(userId: string): Promise<any> {
        return this.getAllSessionsForUser(userId);
    }

    /**
     * Logout all sessions for a user
     * @param {string} userId - The user ID
     * @param {string[]} sessionIds - The session IDs (optional)
     */
    async logoutAllSessions(userId: string, sessionIds: string[] = []): Promise<void> {
        const userSessionsKey = this.getUserSessionsKey(userId);

        // Nếu không có sessionIds truyền vào, lấy toàn bộ session của người dùng từ Redis Set
        sessionIds = sessionIds.length > 0 ? sessionIds : await this.cacheService.smembers(userSessionsKey);

        if (sessionIds.length === 0) {
            return; // Không có sessionId nào, kết thúc hàm
        }

        // Sử dụng pipeline để xóa tất cả sessionId được truyền vào
        const pipeline = this.cacheService.pipeline();

        sessionIds.forEach((sessionId) => {
            const sessionKey = this.getSessionKey(sessionId);

            pipeline.del(sessionKey); // Xóa session cụ thể
            pipeline.srem(userSessionsKey, sessionId); // Xóa sessionId khỏi Redis Set
        });

        // Thực thi pipeline
        const results = await pipeline.exec();

        // Kiểm tra kết quả để chắc chắn rằng các session đã được xóa
        results.forEach((result: [Error | null, any], index: number) => {
            const [error, res] = result;

            res; // eslint-disable-line no-unused-expressions

            if (error) {
                console.error(`Error deleting sessionId: ${get(sessionIds, index)}`);
            }
        });

        // Nếu không có sessionId nào còn lại trong Redis Set, xóa luôn key của Redis Set
        const remainingSessions = await this.cacheService.smembers(userSessionsKey);

        if (remainingSessions.length === 0) {
            await this.cacheService.del(userSessionsKey);
        }
    }

    /**
     * @description Delete all sessions for the current user
     * @param {UserAuth} currentUser - The current user
     * @returns {Promise<{ message: string }>} The response
     */
    async logoutAll(currentUser: UserAuth): Promise<{ message: string }> {
        await this.logoutAllSessions(currentUser.id);

        return {
            message: 'All sessions logged out',
        };
    }

    /**
     *
     * @param {string} id - The user ID
     * @param {string[]} sessionIds - The session IDs
     * @returns {Promise<{ message: string }>} The response
     */
    async logoutSessions(id: string, sessionIds: string[]): Promise<{ message: string }> {
        await this.logoutAllSessions(id, sessionIds);

        return {
            message: 'Sessions logged out',
        };
    }

    /**
     *
     * @param {string} token - The token to verify
     * @param {Details} ua - The user agent data
     * @param {GeoIpI} ipGeo - The geo IP data
     * @returns {Promise<LoginResponse>} The response
     */
    async verifyEmail(token: string, ua: Details, ipGeo: GeoIpI): Promise<LoginResponse> {
        const verify = await this.jwtService.verify<JwtPayload>(token, KeyType.CONFIRMATION_USER_KEY);

        const { isValid, payload } = verify;

        if (!isValid) {
            throw new UnauthorizedException(MESSAGE_INVALID_CREDENTIALS);
        }

        const user = await this.userService.verifyEmail(payload.sub);

        if (!user) {
            throw new UnauthorizedException(MESSAGE_INVALID_CREDENTIALS);
        }

        const data = await this.jwtService.signTokens({
            email: user.email,
            sub: user.id,
            name: user.name,
        });

        const sessionKey = this.getSessionKey(data.refreshToken.sessionId);
        const userSessionsKey = this.getUserSessionsKey(user.id);

        const userData: UserData = {
            ip: ipGeo.ip,
            userAgent: ua.source,
            userId: user.id,
            email: user.email,
            os: ua.os,
            browser: ua.browser,
            jwtId: data.refreshToken.jwtId,
            sessionId: data.refreshToken.sessionId,
        };

        await this.cacheService.set(sessionKey, userData, convertTimeStampToSeconds(data.refreshToken.exp));
        await this.cacheService.sadd(userSessionsKey, data.refreshToken.sessionId);

        delete user.password;

        return {
            data: {
                accessToken: {
                    token: data.accessToken.token,
                    exp: data.accessToken.exp,
                },
                refreshToken: {
                    token: data.refreshToken.token,
                    exp: data.refreshToken.exp,
                },
                user,
            },
            message: 'Login successful',
        };
    }

    /**
     *
     * @param {ResendEmailDto} resendEmailDto - The resend email data
     * @returns {Promise<any>} The response
     */
    async resendVerificationEmail(resendEmailDto: ResendEmailDto): Promise<any> {
        const user = await this.userService.findByEmail(resendEmailDto.email);

        if (!user || user.status === UserStatus.ACTIVE) {
            throw new BadRequestException('User not found or already verified');
        }

        if (user.status === UserStatus.BLOCKED) {
            throw new BadRequestException('User is blocked');
        }

        await this.sendConfirmationEmail(user);

        return {
            message: 'Verification email sent',
        };
    }
}
