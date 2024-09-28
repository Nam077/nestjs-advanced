import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { v4 as uuidv4 } from 'uuid';

import { AccessToken, JwtPayload, JwtResponse, KeyType, RefreshToken } from '../../common';
import { KeyService } from '../key/key.service';

/**
 * JwtServiceLocal provides methods to sign and decode JWT tokens,
 * including access tokens, refresh tokens, confirmation tokens, and password reset tokens.
 */
@Injectable()
export class JwtServiceLocal {
    /**
     * Constructor for JwtServiceLocal.
     * @param {JwtService} jwtService - The JWT service
     * @param {KeyService} keyService - The key service for retrieving signing keys
     * @param {ConfigService} configService - The configuration service for accessing environment variables
     */
    constructor(
        private readonly jwtService: JwtService,
        private readonly keyService: KeyService,
        private readonly configService: ConfigService,
    ) {}

    /**
     * Signs a JWT access token.
     * @param {JwtPayload} payload - The payload to include in the token
     * @returns {Promise<AccessToken>} A promise that resolves with the signed access token and its metadata
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
     * Signs a JWT refresh token.
     * @param {JwtPayload} payload - The payload to include in the token
     * @returns {Promise<RefreshToken>} A promise that resolves with the signed refresh token and its metadata
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
     * Signs a JWT token for user confirmation (e.g., email confirmation).
     * @param {JwtPayload} payload - The payload to include in the confirmation token
     * @returns {Promise<AccessToken>} A promise that resolves with the signed confirmation token and its metadata
     */
    async signConfirmationUserToken(payload: JwtPayload): Promise<AccessToken> {
        const jwtPayload: JwtPayload = {
            sub: payload.sub,
            email: payload.email,
            name: payload.name,
        };

        const jwtId = uuidv4();
        const key = await this.keyService.getCurrentKey(KeyType.CONFIRMATION_USER_KEY);

        const token = this.jwtService.sign(jwtPayload, {
            algorithm: 'RS256',
            keyid: key.id,
            jwtid: jwtId,
            privateKey: key.decryptedPrivateKey,
            expiresIn: this.configService.get('JWT_CONFIRMATION_TOKEN_EXPIRATION_TIME'),
        });

        return {
            token,
            exp: this.jwtService.decode(token).exp,
            jwtId,
        };
    }

    /**
     * Signs a JWT token for resetting the user's password.
     * @param {JwtPayload} payload - The payload to include in the reset password token
     * @returns {Promise<AccessToken>} A promise that resolves with the signed reset password token and its metadata
     */
    async signResetPasswordUserToken(payload: JwtPayload): Promise<AccessToken> {
        const jwtPayload: JwtPayload = {
            sub: payload.sub,
            email: payload.email,
            name: payload.name,
        };

        const jwtId = uuidv4();
        const key = await this.keyService.getCurrentKey(KeyType.RESET_PASSWORD_KEY);

        const token = this.jwtService.sign(jwtPayload, {
            algorithm: 'RS256',
            keyid: key.id,
            jwtid: jwtId,
            privateKey: key.decryptedPrivateKey,
            expiresIn: this.configService.get('JWT_RESET_PASSWORD_TOKEN_EXPIRATION_TIME'),
        });

        return {
            token,
            exp: this.jwtService.decode(token).exp,
            jwtId,
        };
    }

    /**
     * Signs both access and refresh tokens.
     * @param {JwtPayload} payload - The payload to include in the tokens
     * @returns {Promise<JwtResponse>} A promise that resolves with both the signed access and refresh tokens
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
     * Decodes a JWT token.
     * @template T
     * @param {string} token - The JWT token to decode
     * @param {boolean} complete - Whether to include the complete header in the decoded token
     * @returns {T} The decoded token payload
     */
    decode<T>(token: string, complete: boolean = true): T {
        return this.jwtService.decode(token, {
            complete: complete,
        }) as T;
    }

    /**
     * Verifies a JWT token.
     * @template T - The type of the payload
     * @param {string} token - The JWT token to verify
     * @param {KeyType} keyType - The type of key to use for verification
     * @returns {Promise<{isValid: boolean, payload: T}>} A promise that resolves with a boolean indicating whether the token is valid
     */
    async verify<T>(token: string, keyType: KeyType): Promise<{ isValid: boolean; payload: T }> {
        const decodedToken = this.jwtService.decode(token, { complete: true }) as any;

        const kid: string = decodedToken?.header?.kid; // Extract the kid from the header
        const key = await this.keyService.getKeyById(kid);

        if (!key || key.type !== keyType) {
            return {
                isValid: false,
                payload: null,
            };
        }

        try {
            const payload = await this.jwtService.verify(token, {
                algorithms: ['RS256'],
                publicKey: key.publicKey,
            });

            return {
                isValid: true,
                payload,
            };
        } catch (error) {
            console.log('error ' + error);

            return {
                isValid: false,
                payload: null,
            };
        }
    }
}
