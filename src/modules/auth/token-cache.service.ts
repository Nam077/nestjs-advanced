import { Injectable, UnauthorizedException } from '@nestjs/common';

import { BLACKLIST_KEY, WHITELIST_KEY } from '@common/constants';
import { RedisService } from '@modules/cache/cache.service';

/**
 *
 */
@Injectable()
export class TokenCacheService {
    /**
     *
     * @param {RedisService} cacheService - The cache service
     */
    constructor(private readonly cacheService: RedisService) {}

    /**
     * Checks whether the token is blacklisted or whitelisted.
     * @param {string} jti - The JWT ID (jti) from the token payload.
     * @returns {Promise<void>} Resolves if the token is valid, otherwise throws UnauthorizedException.
     */
    async validateTokenInCache(jti: string): Promise<void> {
        if (jti) {
            const [isBlacklisted, isWhitelisted] = await Promise.all([
                this.cacheService.checkExist(`${BLACKLIST_KEY}:${jti}`),
                this.cacheService.checkExist(`${WHITELIST_KEY}:${jti}`),
            ]);

            if (isBlacklisted) {
                throw new UnauthorizedException('Token is blacklisted');
            }

            if (!isWhitelisted) {
                throw new UnauthorizedException('Token is not whitelisted');
            }
        }
    }
}
