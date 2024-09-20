import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { RedisModuleOptions, RedisModuleOptionsFactory } from '@nestjs-modules/ioredis';

/**
 * @description Cache configuration service for handling cache configuration
 */
@Injectable()
export class CacheConfigService implements RedisModuleOptionsFactory {
    /**
     * @description Creates an instance of cache configuration service.
     * @param {ConfigService} configService - Configuration service for handling environment variables
     */
    constructor(private configService: ConfigService) {}

    /**
     * @description Create Redis module options for handling cache
     * Create Redis module options
     * @returns {RedisModuleOptions} - Redis module options
     */
    createRedisModuleOptions(): RedisModuleOptions {
        return {
            type: 'single',
            options: {
                host: this.configService.get<string>('REDIS_HOST', 'localhost'),
                port: this.configService.get<number>('REDIS_PORT', 6379),
            },
        };
    }
}
