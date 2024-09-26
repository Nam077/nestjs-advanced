import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { EmailService } from './email.service';

/**
 *
 */
@Controller('mail')
@ApiTags('Mail')
export class MailController {
    /**
     *
     * @param {EmailService} mailService - The email service
     */
    constructor(private readonly mailService: EmailService) {}

    /**
     * Test endpoint
     * @returns {object} - The test message
     */
    @Get('test')
    testEndpoint() {
        return this.mailService.example();
    }
}
