import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { RabbitMQConfig } from '@golevelup/nestjs-rabbitmq';

export const EMAIL_AUTH = {
    EXCHANGE: 'email-auth', // Tên exchange có thể ngắn hơn, đủ mô tả về mục đích
    ROUTING: {
        CONFIRM: 'email-auth.confirm', // Giữ nguyên cấu trúc
        RESET: 'email-auth.reset',
    },
    QUEUE: {
        CONFIRM: 'email-auth.confirm.queue', // Đồng nhất tên queue với routing key
        RESET: 'email-auth.reset.queue',
    },
};
enum TYPE_EXCHANGE {
    DIRECT = 'direct',
    TOPIC = 'topic',
    FANOUT = 'fanout',
    HEADERS = 'headers',
}

/**
 *
 */
@Injectable()
export class RabbitMQConfigLoader {
    /**
     *
     * @param {ConfigService} configService - The configuration service
     */
    constructor(private readonly configService: ConfigService) {}

    /**
     * Create the RabbitMQ configuration
     * @returns {RabbitMQConfig} The RabbitMQ configuration
     */
    createModuleConfig(): RabbitMQConfig {
        // Return the RabbitMQ configuration here
        return {
            uri: `amqp://${this.configService.get('RABBITMQ_USER')}:${this.configService.get('RABBITMQ_PASS')}@${this.configService.get('RABBITMQ_HOST')}:${this.configService.get('RABBITMQ_PORT')}`,
            exchanges: [
                // Define the exchanges email
                {
                    name: EMAIL_AUTH.EXCHANGE,
                    type: TYPE_EXCHANGE.DIRECT,
                },
            ],
            queues: [],
        };
    }
}
