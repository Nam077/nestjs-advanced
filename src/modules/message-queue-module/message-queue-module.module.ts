import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

import { RabbitMQConfigLoader } from './rabitmq-config.service';
import { MailModule } from '../mail/mail.module';
import { EmailAuthConsumerService } from './consumers/email-auth-consumer.service';
import { EmailAuthProducerService } from './producers/email-auth-producer.service';

/**
 * @module
 * @description Module for the message queue using rabbitmq
 */
@Global()
@Module({
    imports: [
        MailModule,
        ConfigModule,
        RabbitMQModule.forRootAsync(RabbitMQModule, {
            useClass: RabbitMQConfigLoader,
        }),
    ],
    providers: [RabbitMQConfigLoader, EmailAuthConsumerService, EmailAuthProducerService],
    exports: [EmailAuthProducerService],
})
export class MessageQueueModuleModule {}
