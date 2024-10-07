import { Controller, Get } from '@nestjs/common';

import { AppService } from '@/app.service';

/**
 *
 */
@Controller()
export class AppController {
    /**
     *
     * @param {AppService} appService -  The app service instance
     */
    constructor(private readonly appService: AppService) {}

    /**
     * @description Get hello world
     * @returns {string} - Hello world
     */
    @Get()
    getHello(): string {
        return this.appService.getHello();
    }
}
