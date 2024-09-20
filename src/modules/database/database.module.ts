import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DatabaseConfigService } from './database-config/database-config.service';

/**
 * Database module for handling database configuration
 */
@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfigService,
    }),
  ],
  providers: [DatabaseConfigService],
})
export class DatabaseModule {}
