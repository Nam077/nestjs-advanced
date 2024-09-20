import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { RedisModule } from '@nestjs-modules/ioredis';

import { CacheConfigService } from './cache-config/cache-config.service';

/**
 *
 */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    RedisModule.forRootAsync({
      useClass: CacheConfigService,
    }),
  ],
  providers: [CacheConfigService],
})
export class CacheModule {}
