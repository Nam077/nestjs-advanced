import { Inject, Injectable, LoggerService } from '@nestjs/common';

import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

/**
 *
 */
@Injectable()
export class AppService {
    /**
     *
     * @param {LoggerService} logger - The logger service instance
     */
    constructor(@Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService) {}
    /**
     * @returns {string} A simple greeting message.
     */
    getHello(): string {
        this.logger.error('Hello World!');

        return 'Hello World!';
    }
}
