import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DatabaseConfigService } from './database-config/database-config.service';

/**
 * Database module for handling database configuration
 */
@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            useClass: DatabaseConfigService,
        }),
    ],
    providers: [DatabaseConfigService],
})
export class DatabaseModule {}
