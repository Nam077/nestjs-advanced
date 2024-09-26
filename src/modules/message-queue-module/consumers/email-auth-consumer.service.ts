import { Injectable } from '@nestjs/common';

import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';

import { EmailService } from '../../mail/email.service';
import { EMAIL_AUTH } from '../rabitmq-config.service';

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
     * @param {object} message - The message to handle
     * @param {string} message.to - The email address to send the email to
     * @param {string} message.token - The token to send
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
    public async handleConfirmationEmail(message: { to: string; token: string }) {
        this.emailService.example(message.to);
    }

    /**
     *
     * @param {string} message - The message to handle
     */
    @RabbitSubscribe({
        exchange: EMAIL_AUTH.EXCHANGE,
        routingKey: EMAIL_AUTH.ROUTING.RESET,
        queue: EMAIL_AUTH.QUEUE.RESET,
    })
    public async handleResetPasswordEmail(message: any) {
        console.log('Gửi email reset mật khẩu đến:', message.to);
        // Logic gửi email reset mật khẩu
    }
}
