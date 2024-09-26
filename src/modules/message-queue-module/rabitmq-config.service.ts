import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { RabbitMQConfig } from '@golevelup/nestjs-rabbitmq';

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
            exchanges: [],
            queues: [],
        };
    }
}
