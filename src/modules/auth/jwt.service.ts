import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { v4 as uuidv4 } from 'uuid';

import { AccessToken, JwtPayload, JwtResponse, KeyType, RefreshToken } from '../../common';
import { KeyService } from '../key/key.service';
import { User } from '../user/entities/user.entity';

/**
 *
 */
@Injectable()
export class JwtServiceLocal {
    /**
     *
     * @param {JwtService} jwtService - The JWT service
     * @param {KeyService} keyService - The key service
     * @param {ConfigService} configService - The configuration service
     */
    constructor(
        private readonly jwtService: JwtService,
        private readonly keyService: KeyService,
        private readonly configService: ConfigService,
    ) {}

    /**
     *
     * @param {User} user - The user entity
     * @returns {string} The access token
     */
    async signAccessToken(user: User): Promise<AccessToken> {
        const jwtPayload: JwtPayload = {
            sub: user.id,
            email: user.email,
            name: user.name,
        };

        const jwtId = uuidv4();
        const key = await this.keyService.getCurrentKey(KeyType.ACCESS_KEY);

        const token = this.jwtService.sign(jwtPayload, {
            algorithm: 'RS256',
            keyid: key.id,
            jwtid: jwtId,
            privateKey: key.decryptedPrivateKey,
            expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME'),
        });

        return {
            token,
            exp: this.jwtService.decode(token).exp,
            jwtId,
        };
    }

    /**
     *
     * @param {User} user - The payload
     * @returns {string} The refresh token
     */
    async signRefreshToken(user: User): Promise<RefreshToken> {
        const key = await this.keyService.getCurrentKey(KeyType.REFRESH_KEY);
        const sessionId = uuidv4();

        const jwtPayload: JwtPayload = {
            sub: user.id,
            email: user.email,
            name: user.name,
            sessionId,
        };

        const jwtId = uuidv4();

        const token = this.jwtService.sign(jwtPayload, {
            algorithm: 'RS256',
            keyid: key.id,
            jwtid: jwtId,
            secret: key.decryptedPrivateKey,
            expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME'),
        });

        return {
            token,
            exp: this.jwtService.decode(token).exp,
            jwtId,
            sessionId,
        };
    }

    /**
     *
     * @param {User} user - the user entity
     * @returns {JwtResponse} The JWT response
     */
    async signTokens(user: User): Promise<JwtResponse> {
        const accessToken = await this.signAccessToken(user);
        const refreshToken = await this.signRefreshToken(user);

        delete user.password;

        return {
            user,
            accessToken,
            refreshToken,
        };
    }
}
