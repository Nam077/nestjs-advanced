import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

import { Key } from '@modules/key/entities/key.entity';
import { User } from '@modules/user/entities/user.entity';

/**
 * @description Database configuration service for handling database configuration
 */
@Injectable()
export class DatabaseConfigService implements TypeOrmOptionsFactory {
    /**
     * @param {ConfigService} configService - Configuration service for handling environment variables
     */
    constructor(private configService: ConfigService) {}

    /**
     * @description Create TypeORM options for handling database
     * @returns {TypeOrmModuleOptions} - TypeORM options
     * @memberof DatabaseConfigService
     */
    createTypeOrmOptions(): TypeOrmModuleOptions {
        return {
            type: 'postgres',
            host: this.configService.get<string>('DB_HOST', 'localhost'),
            port: this.configService.get<number>('DB_PORT', 5432),
            username: this.configService.get<string>('DB_USER'),
            password: this.configService.get<string>('DB_PASSWORD'),
            database: this.configService.get<string>('DB_DB'),
            entities: [User, Key],
            synchronize: this.configService.get<string>('NODE_ENV') === 'development', // chỉ bật trong môi trường phát triển
        };
    }
}
