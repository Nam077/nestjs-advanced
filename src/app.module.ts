import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { CacheModule } from './modules/cache/cache.module';
import { DatabaseModule } from './modules/database/database.module';
import { KeyModule } from './modules/key/key.module';
import { MailModule } from './modules/mail/mail.module';
import { MessageQueueModuleModule } from './modules/message-queue-module/message-queue-module.module';
import { SessionModule } from './modules/session/session.module';
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
        SessionModule,
        MailModule,
        MessageQueueModuleModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
