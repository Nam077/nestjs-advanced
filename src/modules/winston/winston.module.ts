/**
 * This module provides a wrapper around the Winston logger library.
 * It allows for easy configuration and usage of the logger in a NestJS application.
 */

import { Module } from '@nestjs/common';

import { WinstonModule } from 'nest-winston';

import { WinstonConfigService } from '@modules/winston/winston-config.service';

/**
 * The Winston module that provides a wrapper around the Winston logger library.
 */
@Module({
    imports: [
        WinstonModule.forRootAsync({
            useClass: WinstonConfigService,
        }),
    ],
})
export class WinstonModuleConfig {}
