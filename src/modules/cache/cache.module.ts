import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { RedisModule } from '@nestjs-modules/ioredis';

import { CacheConfigService } from '@modules/cache/cache-config/cache-config.service';
import { RedisService } from '@modules/cache/cache.service';

/**
 *
 */
@Global()
@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        RedisModule.forRootAsync({
            useClass: CacheConfigService,
        }),
    ],
    providers: [CacheConfigService, RedisService],
    exports: [RedisService],
})
export class CacheModule {}
