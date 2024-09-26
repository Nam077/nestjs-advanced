import { Injectable, UnauthorizedException } from '@nestjs/common';

import { Details } from 'express-useragent';

import { JwtServiceLocal } from './jwt.service';
import { UserService } from '../user/user.service';
import { LoginDto } from './dtos/login.dto';
import {
    AccessToken,
    convertTimeStampToSeconds,
    GeoIpI,
    JwtPayload,
    JwtResponse,
    RefreshToken,
    SESSION_KEY,
    UserAuth,
} from '../../common';
import { RedisService } from '../cache/cache.service';
import { User } from '../user/entities/user.entity';

export interface UserData {
    ip: string;
    userAgent: string;
    userId: string;
    email: string;
    os: string;
    browser: string;
    jwtId: string;
}
export interface LoginResponse {
    data: {
        accessToken: Omit<AccessToken, 'jwtId'>;
        refreshToken: Omit<RefreshToken, 'jwtId' | 'sessionId'>;
        user: User;
    };
    message: string;
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
     */
    constructor(
        private readonly jwtService: JwtServiceLocal,
        private readonly userService: UserService,
        private readonly cacheService: RedisService,
    ) {}

    /**
     * Login a user
     * @param {LoginDto} loginDto - The login data
     * @param {Details} ua - The user agent data
     * @param {GeoIpI} ipGeo - The geo IP data
     * @returns {Promise<JwtResponse>} The JWT response
     * @throws {Error} The error message
     */
    async login(loginDto: LoginDto, ua: Details, ipGeo: GeoIpI): Promise<LoginResponse> {
        const { email, password } = loginDto;
        const user = await this.userService.findByEmail(email);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isValid = user.comparePassword(password);

        if (!isValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const data = await this.jwtService.signTokens({
            email: user.email,
            sub: user.id,
            name: user.name,
        });

        const key = `${SESSION_KEY}:${data.refreshToken.sessionId}`;

        const userData: UserData = {
            ip: ipGeo.ip,
            userAgent: ua.source,
            userId: user.id,
            email: user.email,
            os: ua.os,
            browser: ua.browser,
            jwtId: data.refreshToken.jwtId,
        };

        await this.cacheService.set(key, userData, convertTimeStampToSeconds(data.refreshToken.exp));
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
     * @param {JwtPayload} payload - The payload
     * @returns {Promise<User>} The user entity
     * @throws {UnauthorizedException} The unauthorized exception
     */
    async validateUser(payload: JwtPayload): Promise<User> {
        return this.userService.findByEmailAndId(payload.email, payload.sub);
    }

    /**
     *
     * @param {string} userId - The user ID
     * @param {string} refreshToken - The refresh token
     * @returns {Promise<UserAuth>} The user entity
     */
    async validateRefreshToken(userId: string, refreshToken: string): Promise<UserAuth> {
        const decodeData = this.jwtService.decode(refreshToken) as JwtPayload;

        const message = 'Invalid token';

        if (!decodeData) {
            throw new UnauthorizedException(message);
        }

        const key = `${SESSION_KEY}:${decodeData.sessionId}`;
        const userData = await this.cacheService.get<UserData>(key);

        if (!userData) {
            throw new UnauthorizedException(message);
        }

        if (userData.jwtId !== decodeData.jti) {
            throw new UnauthorizedException(message);
        }

        const user = await this.userService.findByEmailAndId(decodeData.email, userId);

        return {
            ...user,
            sessionId: decodeData.sessionId,
        };
    }

    /**
     *
     * @param {UserAuth} currentUser - The current user
     * @returns {Promise<JwtResponse>} The JWT response
     */
    async refresh(currentUser: UserAuth): Promise<any> {
        const data = await this.jwtService.signTokens({
            email: currentUser.email,
            sub: currentUser.id,
            name: currentUser.name,
            sessionId: currentUser.sessionId,
        });

        const key = `${SESSION_KEY}:${currentUser.sessionId}`;

        const userData = await this.cacheService.get<UserData>(key);

        if (!userData) {
            throw new UnauthorizedException('Invalid token');
        }

        userData.jwtId = data.refreshToken.jwtId;

        await this.cacheService.update(key, userData, convertTimeStampToSeconds(data.refreshToken.exp));

        return {
            accessToken: {
                token: data.accessToken.token,
                exp: data.accessToken.exp,
            },
            refreshToken: {
                token: data.refreshToken.token,
                exp: data.refreshToken.exp,
            },
        };
    }
}
