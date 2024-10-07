import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PassportStrategy } from '@nestjs/passport';

import { Request } from 'express';
import { ExtractJwt, Strategy, VerifiedCallback } from 'passport-jwt';

import { JwtPayload, KeyType, UserAuth } from '@/common';
import { AuthService } from '@modules/auth/auth.service';
import { KeyService } from '@modules/key/key.service';

import { TokenCacheService } from '../token-cache.service';

/**
 * Strategy for handling refresh tokens using JWT and Passport.
 * Validates refresh tokens by checking if they are blacklisted/whitelisted
 * and ensuring the correct cryptographic key is used.
 */
@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
    /**
     * Constructor for the RefreshStrategy.
     * @param {KeyService} keyService - The key service for fetching cryptographic keys.
     * @param {JwtService} jwtService - The JWT service for decoding and verifying tokens.
     * @param {AuthService} authService - The authentication service for validating tokens.
     * @param {TokenCacheService} tokenCacheService - The cache service for token operations.
     */
    constructor(
        private readonly keyService: KeyService,
        private readonly jwtService: JwtService,
        private readonly authService: AuthService,
        private readonly tokenCacheService: TokenCacheService,
    ) {
        super({
            /**
             * Extracts the JWT from the request, specifically from the refresh token cookie.
             * @param {Request} req - The incoming HTTP request.
             * @returns {string} The extracted JWT token from the cookie.
             */
            jwtFromRequest: ExtractJwt.fromExtractors([(req: Request) => req.cookies?.refreshToken]),
            ignoreExpiration: false,
            secretOrKeyProvider: RefreshStrategy.secretOrKeyProvider(keyService, jwtService),
            passReqToCallback: true,
        });
    }

    /**
     * Provides the secret or public key dynamically based on the JWT token's kid (key ID).
     * It verifies if the token is blacklisted or not whitelisted and fetches the appropriate key.
     * @param {KeyService} keyService - Service to retrieve cryptographic keys.
     * @param {JwtService} jwtService - Service to decode the JWT token.
     * @returns {Function} A function that dynamically provides the secret key.
     */
    static secretOrKeyProvider(
        keyService: KeyService,
        jwtService: JwtService,
    ): (request: Request, rawJwtToken: string, done: VerifiedCallback) => Promise<void> {
        return async (request: Request, rawJwtToken: string, done: VerifiedCallback): Promise<void> => {
            try {
                const decodedToken = jwtService.decode(rawJwtToken, { complete: true }) as any;
                const { kid } = decodedToken?.header || {};

                // Fetch the key based on kid
                const key = await keyService.getKeyById(kid);

                if (!key || key.type !== KeyType.REFRESH_KEY) {
                    return done(new UnauthorizedException('Invalid key'), null);
                }

                // Provide the public key for validation
                return done(null, key.publicKey);
            } catch (error) {
                return done(error, null);
            }
        };
    }

    /**
     * Validates the refresh token and ensures the user is authenticated.
     * @param {Request} req - The incoming HTTP request.
     * @param {JwtPayload} jwtPayload - The decoded JWT payload.
     * @returns {Promise<UserAuth>} A promise that resolves with the authenticated user details.
     * @throws {UnauthorizedException} If the token is invalid or the user is not found.
     */
    async validate(req: Request, jwtPayload: JwtPayload): Promise<UserAuth> {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            throw new UnauthorizedException('Missing refresh token');
        }

        await this.tokenCacheService.validateTokenInCache(jwtPayload.jti);

        const user = await this.authService.validateRefreshToken(jwtPayload.sub, refreshToken);

        if (!user) {
            throw new UnauthorizedException('Invalid token');
        }

        return user;
    }
}
