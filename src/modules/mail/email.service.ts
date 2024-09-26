import { Injectable } from '@nestjs/common';

import { MailerService } from '@nestjs-modules/mailer';

/**
 *
 */
@Injectable()
export class EmailService {
    /**
     *
     * @param {MailerService} mailerService - The mailer service
     */
    constructor(private readonly mailerService: MailerService) {}

    /**
     * Example method
     * @param {string} to - The email address to send the email to
     * @returns {Promise<void>} - The promise
     */
    public async example(to: string): Promise<void> {
        return await this.mailerService.sendMail({
            to: to,
            subject: 'Testing Nest Mailer',
            template: 'welcome',
            context: {
                name: 'Nam Nguyen',
            },
        });
    }
}
