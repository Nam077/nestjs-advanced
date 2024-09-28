import { Injectable } from '@nestjs/common';

import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';

export interface MailerPayload<T> extends ISendMailOptions {
    context: T;
}
export interface EmailConfirmationPayload {
    user: {
        name: string;
        email: string;
        verifyUrl: string;
    };
}

export interface EmailResetPasswordPayload {
    user: {
        name: string;
        email: string;
        resetUrl: string;
    };
}

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

    /**
     * @template T - The context type
     * @param {MailerPayload<T>} payload - The payload
     * @returns {Promise<void>} - The promise
     */
    public async sendEmail<T>(payload: MailerPayload<T>): Promise<void> {
        return await this.mailerService.sendMail({
            ...payload,
        });
    }

    /**
     *
     * @param {EmailConfirmationPayload} payload - The payload
     * @returns {Promise<void>} - The promise
     */
    public async sendEmailConfirmation(payload: EmailConfirmationPayload): Promise<void> {
        return await this.sendEmail<EmailConfirmationPayload>({
            to: payload.user.email,
            subject: 'Email Confirmation',
            template: 'email-confirmation',
            context: payload,
        });
    }

    /**
     *
     * @param {EmailResetPasswordPayload} payload - The payload
     * @returns {Promise<void>} - The promise
     */
    public async sendEmailResetPassword(payload: EmailResetPasswordPayload): Promise<void> {
        return await this.sendEmail<EmailResetPasswordPayload>({
            to: payload.user.email,
            subject: 'Reset Password',
            template: 'reset-password',
            context: payload,
        });
    }
}
