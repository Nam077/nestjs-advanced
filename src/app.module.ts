import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CacheModule } from '@cache/cache.module';
import { I18nModuleLocal } from '@i18n/i18n.module';
import { AuthModule } from '@modules/auth/auth.module';
import { KeyModule } from '@modules/key/key.module';
import { MailModule } from '@modules/mail/mail.module';
import { SessionModule } from '@modules/session/session.module';
import { UserModule } from '@modules/user/user.module';
import { WinstonModuleConfig } from '@modules/winston/winston.module';
import { DatabaseConfigService } from '@providers/database-config.service';
import { MessageQueueModuleModule } from '@rbmq/message-queue-module.module';
import { AppController } from '@src/app.controller';
import { AppService } from '@src/app.service';

/**
 *
 */
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        ScheduleModule.forRoot(),
        I18nModuleLocal,
        CacheModule,
        WinstonModuleConfig,
        ThrottlerModule.forRoot([
            {
                ttl: 60000,
                limit: 10,
            },
        ]),
        TypeOrmModule.forRootAsync({
            useClass: DatabaseConfigService,
        }),
        UserModule,
        AuthModule,
        KeyModule,
        SessionModule,
        MailModule,
        MessageQueueModuleModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        DatabaseConfigService,
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule {}
