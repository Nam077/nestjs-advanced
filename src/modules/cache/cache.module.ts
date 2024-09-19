import { Module } from '@nestjs/common';
import { RedisModule } from '@nestjs-modules/ioredis';
import { ConfigModule } from '@nestjs/config';
import { CacheConfigService } from './cache-config/cache-config.service';

@Module({
  imports: [
    ConfigModule,
    RedisModule.forRootAsync({
      useClass: CacheConfigService,
    }),
  ],
  providers: [CacheConfigService],
})
export class CacheModule {}
