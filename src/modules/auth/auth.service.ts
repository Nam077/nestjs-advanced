import { Injectable, UnauthorizedException } from '@nestjs/common';

import { JwtServiceLocal } from './jwt.service';
import { UserService } from '../user/user.service';
import { LoginDto } from './dtos/login.dto';
import { JwtPayload, JwtResponse } from '../../common';
import { User } from '../user/entities/user.entity';

export interface LoginResponse {
    data: JwtResponse;
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
     */
    constructor(
        private readonly jwtService: JwtServiceLocal,
        private readonly userService: UserService,
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

        return {
            data: await this.jwtService.signTokens(user),
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
