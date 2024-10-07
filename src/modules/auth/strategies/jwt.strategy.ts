import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PassportStrategy } from '@nestjs/passport';

import { ExtractJwt, Strategy, VerifiedCallback } from 'passport-jwt';

import { JwtPayload, KeyType } from '@/common';
import { AuthService } from '@modules/auth/auth.service';
import { KeyService } from '@modules/key/key.service';
import { User } from '@modules/user/entities/user.entity';

import { TokenCacheService } from '../token-cache.service';

/**
 *
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    /**
     *
     * @param {KeyService} keyService - The key service
     * @param {JwtService} jwtService - The JWT service
     * @param {AuthService} authService - The authentication service
     * @param {TokenCacheService} tokenCacheService - The token cache service
     */
    constructor(
        private readonly keyService: KeyService,
        private readonly jwtService: JwtService,
        private readonly authService: AuthService,
        private readonly tokenCacheService: TokenCacheService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKeyProvider: JwtStrategy.secretOrKeyProvider(keyService, jwtService),
        });
    }

    /**
     *
     * @param {JwtPayload} payload - The payload
     * @returns {Promise<User>} The user entity
     */
    async validate(payload: JwtPayload): Promise<User> {
        const user = await this.authService.validateUser(payload);

        if (!user) {
            throw new UnauthorizedException('Invalid token');
        }

        await this.tokenCacheService.validateTokenInCache(payload.jti);

        return user;
    }

    /**
     * Dynamically provides the secret key based on the kid in the JWT header.
     * @param {KeyService} keyService - Service for retrieving the secret key.
     * @param {JwtService} jwtService - Service for decoding JWT tokens.
     * @returns {(request: Request, rawJwtToken: string, done: VerifiedCallback) => Promise<void>} - A function to provide the secret key for Passport.
     */
    static secretOrKeyProvider(
        keyService: KeyService,
        jwtService: JwtService,
    ): (request: Request, rawJwtToken: string, done: VerifiedCallback) => Promise<void> {
        return async (request: Request, rawJwtToken: string, done: VerifiedCallback): Promise<void> => {
            try {
                const decodedToken = jwtService.decode(rawJwtToken, { complete: true }) as any;
                const kid: string = decodedToken?.header?.kid; // Extract the kid from the header

                if (!kid) {
                    return done(new UnauthorizedException('Missing kid in token header'), null);
                }

                const key = await keyService.getKeyById(kid);

                if (!key || key.type !== KeyType.ACCESS_KEY) {
                    return done(new UnauthorizedException('Invalid kid'), null);
                }

                return done(null, key.publicKey);
            } catch (error) {
                return done(error, null);
            }
        };
    }
}
