import { Injectable } from '@nestjs/common';

import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';

import { EmailService, EmailConfirmationPayload, EmailResetPasswordPayload } from '@modules/mail/email.service';
import { EMAIL_AUTH } from '@rbmq/rabitmq-config.service';

/**
 *
 */
@Injectable()
export class EmailAuthConsumerService {
    /**
     *
     * @param {EmailService} emailService - The email service
     */
    constructor(private readonly emailService: EmailService) {}

    /**
     *
     * @param {EmailConfirmationPayload} payload - The payload
     * @returns {Promise<void>} - The promise
     */
    @RabbitSubscribe({
        exchange: EMAIL_AUTH.EXCHANGE,
        routingKey: EMAIL_AUTH.ROUTING.CONFIRM,
        queue: EMAIL_AUTH.QUEUE.CONFIRM,
        queueOptions: {
            messageTtl: 1000 * 60 * 5, // 5 minutes
        },
    })
    public async handleConfirmationEmail(payload: EmailConfirmationPayload): Promise<void> {
        await this.emailService.sendEmailConfirmation(payload);
    }

    /**
     *
     * @param {EmailResetPasswordPayload} payload - The payload
     */
    @RabbitSubscribe({
        exchange: EMAIL_AUTH.EXCHANGE,
        routingKey: EMAIL_AUTH.ROUTING.RESET,
        queue: EMAIL_AUTH.QUEUE.RESET,
    })
    public async handleResetPasswordEmail(payload: EmailResetPasswordPayload) {
        await this.emailService.sendEmailResetPassword(payload);
    }
}
