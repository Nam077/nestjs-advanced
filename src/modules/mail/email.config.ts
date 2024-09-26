import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { MailerOptions, MailerOptionsFactory } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
import { join } from 'path';

/**
 *
 */
@Injectable()
export class MailerConfig implements MailerOptionsFactory {
    /**
     *
     * @param {ConfigService} configService - The configuration service
     */
    constructor(private readonly configService: ConfigService) {}
    /**
     * Create the mailer options
     * @returns {MailerOptions} The mailer options
     */
    createMailerOptions(): MailerOptions {
        return {
            transport: {
                host: this.configService.get('MAIL_HOST'),
                port: this.configService.get('MAIL_PORT'),
                secure: false,
                auth: {
                    user: this.configService.get('MAIL_USER'),
                    pass: this.configService.get('MAIL_PASS'),
                },
            },
            defaults: {
                from: this.configService.get('MAIL_FROM'),
            },
            template: {
                dir: join(__dirname, '../../mails/templates'),
                adapter: new PugAdapter(),
                options: {
                    strict: true,
                },
            },
        };
    }
}
