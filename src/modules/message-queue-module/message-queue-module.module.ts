import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

import { RabbitMQConfigLoader } from './rabitmq-config.service';

/**
 * @module
 * @description Module for the message queue using rabbitmq
 */
@Module({
    imports: [
        ConfigModule,
        RabbitMQModule.forRootAsync(RabbitMQModule, {
            useClass: RabbitMQConfigLoader,
        }),
    ],
    providers: [],
    exports: [],
})
export class MessageQueueModuleModule {}
