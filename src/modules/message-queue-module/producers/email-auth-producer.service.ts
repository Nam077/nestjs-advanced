import { Injectable } from '@nestjs/common';

import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

import { EMAIL_AUTH } from '../rabitmq-config.service';

/**
 *
 */
@Injectable()
export class EmailAuthProducerService {
    /**
     *
     * @param {AmqpConnection} amqpConnection - The RabbitMQ connection
     */
    constructor(private readonly amqpConnection: AmqpConnection) {}

    /**
     *
     * @param {string} to - The email address to send the email to
     * @param {string} token - The token to send
     */
    async sendConfirmationEmail(to: string, token: string) {
        await this.amqpConnection.publish(EMAIL_AUTH.EXCHANGE, EMAIL_AUTH.ROUTING.CONFIRM, {
            to,
            token,
        });
    }

    /**
     *
     * @param {string} to - The email address to send the email to
     * @param {string} token - The token to send
     */
    async sendResetPasswordEmail(to: string, token: string) {
        await this.amqpConnection.publish(EMAIL_AUTH.EXCHANGE, EMAIL_AUTH.ROUTING.RESET, {
            to,
            token,
        });
    }
}
