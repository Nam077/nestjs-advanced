import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { RedisModule } from '@nestjs-modules/ioredis';

import { CacheConfigService } from './cache-config/cache-config.service';
import { RedisService } from './cache.service';
import { ExampleController } from './example.controller';

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
    controllers: [ExampleController],
    exports: [RedisService],
})
export class CacheModule {}
