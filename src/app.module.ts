import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { CacheModule } from '@cache/cache.module';
import { I18nModuleLocal } from '@i18n/i18n.module';
import { AuthModule } from '@modules/auth/auth.module';
import { KeyModule } from '@modules/key/key.module';
import { MailModule } from '@modules/mail/mail.module';
import { MessageQueueModule } from '@modules/message-queue/message-queue.module';
import { DatabaseConfigService } from '@modules/providers/database-config.service';
import { UserModule } from '@modules/user/user.module';
import { WinstonModuleConfig } from '@modules/winston/winston.module';

/**
 *
 */
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        I18nModuleLocal,

        ScheduleModule.forRoot(),
        CacheModule,
        WinstonModuleConfig,
        TypeOrmModule.forRootAsync({
            useClass: DatabaseConfigService,
        }),
        ThrottlerModule.forRoot([
            {
                ttl: 60000,
                limit: 10,
            },
        ]),
        UserModule,
        AuthModule,
        KeyModule,
        MailModule,
        MessageQueueModule,
        I18nModuleLocal,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        DatabaseConfigService,
        {
            provide: 'APP_GUARD',
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule {}
