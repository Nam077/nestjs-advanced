import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { CacheModule } from './modules/cache/cache.module';
import { DatabaseModule } from './modules/database/database.module';
import { KeyModule } from './modules/key/key.module';
import { UserModule } from './modules/user/user.module';
import { WinstonModuleConfig } from './modules/winston/winston.module';
/**
 *
 */
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        ScheduleModule.forRoot(),
        CacheModule,
        WinstonModuleConfig,
        DatabaseModule,
        UserModule,
        AuthModule,
        KeyModule,
    ],
    controllers: [AppController],
    providers: [AppService, ConfigService],
})
export class AppModule {
    /**
     *
     * @param {ConfigService} configService - Configuration service for handling environment variables
     */
    constructor(private configService: ConfigService) {
        console.log(`NODE_ENV: ${this.configService.get('POSTGRES_HOST')}`);
    }
}
