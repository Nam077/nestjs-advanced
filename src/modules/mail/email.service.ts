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
     * @returns {Promise<void>} - The promise
     */
    public async example(): Promise<void> {
        return await this.mailerService.sendMail({
            to: 'namnguyen177a@gmail.com',
            subject: 'Testing Nest Mailer',
            template: 'welcome',
            context: {
                name: 'Nam Nguyen',
            },
        });
    }
}
