import { Module } from '@nestjs/common';

import { MailerModule } from '@nestjs-modules/mailer';

import { MailerConfig } from './email.config';
import { EmailService } from './email.service';
/**
 *
 */
@Module({
    imports: [
        MailerModule.forRootAsync({
            useClass: MailerConfig,
        }),
    ],
    providers: [MailerConfig, EmailService],
    exports: [EmailService],
})
export class MailModule {}
