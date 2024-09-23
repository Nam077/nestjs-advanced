import { Injectable, UnauthorizedException } from '@nestjs/common';

import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

import { JwtServiceLocal } from './jwt.service';
import { UserService } from '../user/user.service';
import { LoginDto } from './dtos/login.dto';
import { AccessToken, JwtPayload, JwtResponse, RefreshToken } from '../../common';
import { User } from '../user/entities/user.entity';

export interface LoginResponse {
    data: {
        accessToken: Omit<AccessToken, 'jwtId'>;
        refreshToken: Omit<RefreshToken, 'jwtId'>;
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
     * @param {Redis} redis - The Redis instance
     */
    constructor(
        private readonly jwtService: JwtServiceLocal,
        private readonly userService: UserService,
        @InjectRedis() private readonly redis: Redis,
    ) {}

    /**
     * Login a user
     * @param {LoginDto} loginDto - The login data
     * @returns {Promise<JwtResponse>} The JWT response
     * @throws {Error} The error message
     */
    async login(loginDto: LoginDto): Promise<LoginResponse> {
        const { email, password } = loginDto;
        const user = await this.userService.findByEmail(email);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isValid = user.comparePassword(password);

        if (!isValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const data = await this.jwtService.signTokens(user);
        const key = `refreshToken:${data.refreshToken.jwtId}`;

        await this.redis.set(key, data.refreshToken.token, 'EX', data.refreshToken.exp);

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
                user: data.user,
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
}
