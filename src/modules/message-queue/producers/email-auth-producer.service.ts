import { Injectable } from '@nestjs/common';

import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

import { EmailConfirmationPayload, EmailResetPasswordPayload } from '@modules/mail/email.service';
import { EMAIL_AUTH } from '@rbmq/rabitmq-config.service';

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
     * @param {EmailConfirmationPayload} payload - The payload
     */
    async sendConfirmationEmail(payload: EmailConfirmationPayload) {
        await this.amqpConnection.publish(EMAIL_AUTH.EXCHANGE, EMAIL_AUTH.ROUTING.CONFIRM, payload);
    }

    /**
     *
     * @param {EmailResetPasswordPayload} payload - The payload
     */
    async sendResetPasswordEmail(payload: EmailResetPasswordPayload) {
        await this.amqpConnection.publish(EMAIL_AUTH.EXCHANGE, EMAIL_AUTH.ROUTING.RESET, payload);
    }
}
