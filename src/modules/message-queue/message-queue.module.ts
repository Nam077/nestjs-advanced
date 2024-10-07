import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

import { MailModule } from '@modules/mail/mail.module';
import { EmailAuthConsumerService } from '@modules/message-queue/consumers/email-auth-consumer.service';
import { EmailAuthProducerService } from '@modules/message-queue/producers/email-auth-producer.service';
import { RabbitMQConfigLoader } from '@modules/message-queue/rabitmq-config.service';

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
export class MessageQueueModule {}
