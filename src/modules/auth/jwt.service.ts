import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { v4 as uuidv4 } from 'uuid';

import { AccessToken, JwtPayload, JwtResponse, KeyType, RefreshToken } from '../../common';
import { KeyService } from '../key/key.service';

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
     * @param {JwtPayload} payload - The payload
     * @returns {string} The access token
     */
    async signAccessToken(payload: JwtPayload): Promise<AccessToken> {
        const jwtPayload: JwtPayload = {
            sub: payload.sub,
            email: payload.email,
            name: payload.name,
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
     * @param {JwtPayload} payload - The payload
     * @returns {string} The refresh token
     */
    async signRefreshToken(payload: JwtPayload): Promise<RefreshToken> {
        const key = await this.keyService.getCurrentKey(KeyType.REFRESH_KEY);

        payload.sessionId ??= uuidv4();

        const jwtPayload: JwtPayload = {
            sub: payload.sub,
            email: payload.email,
            name: payload.name,
            sessionId: payload.sessionId,
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
            sessionId: payload.sessionId,
        };
    }

    /**
     *
     * @param {JwtPayload} payload - The payload
     * @returns {JwtResponse} The JWT response
     */
    async signTokens(payload: JwtPayload): Promise<JwtResponse> {
        const accessToken = await this.signAccessToken(payload);
        const refreshToken = await this.signRefreshToken(payload);

        return {
            accessToken,
            refreshToken,
        };
    }

    /**
     * @template T
     * @param {string} token - The token
     * @returns {T} The decoded token
     */
    decode<T>(token: string): T {
        return this.jwtService.decode(token) as T;
    }
}
