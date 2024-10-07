import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PassportStrategy } from '@nestjs/passport';

import { FastifyRequest } from 'fastify';
import { ExtractJwt, Strategy, VerifiedCallback } from 'passport-jwt';

import { JwtPayload, KeyType, UserAuth } from '@/common';
import { AuthService } from '@modules/auth/auth.service';
import { KeyService } from '@modules/key/key.service';

/**
 *
 */
@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
    /**
     *
     * @param {KeyService} keyService - The key service
     * @param {JwtService} jwtService - The JWT service
     * @param {AuthService} authService - The authentication service
     */
    constructor(
        private readonly keyService: KeyService,
        private readonly jwtService: JwtService,
        private readonly authService: AuthService,
    ) {
        super({
            /**
             *
             * @param {Request} req - The request object
             * @returns {string} The JWT token
             */
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req: FastifyRequest) => {
                    return req.cookies?.refreshToken;
                },
            ]),
            ignoreExpiration: false,
            secretOrKeyProvider: RefreshStrategy.secretOrKeyProvider(keyService, jwtService),
            passReqToCallback: true,
        });
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

                if (!key || key.type !== KeyType.REFRESH_KEY) {
                    return done(new UnauthorizedException('Invalid key'), null);
                }

                return done(null, key.publicKey);
            } catch (error) {
                return done(error, null);
            }
        };
    }

    /**
     *
     * @param {FastifyRequest} req - The Fastify request object
     * @param {JwtPayload} payload - The JWT payload
     * @returns {Promise<UserAuth>} The user entity
     */
    async validate(req: FastifyRequest, payload: JwtPayload): Promise<UserAuth> {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            throw new UnauthorizedException('Missing refresh token');
        }

        const userId = payload.sub;
        const user = await this.authService.validateRefreshToken(userId, refreshToken);

        if (!user) {
            throw new UnauthorizedException('Invalid token');
        }

        return user;
    }
}
