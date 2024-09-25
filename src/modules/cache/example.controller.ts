import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { RedisService } from './cache.service';

/**
 *
 */
@Controller('example')
@ApiTags('Example')
export class ExampleController {
    /**
     *
     * @param {RedisService} redisService - The Redis service
     */
    constructor(private readonly redisService: RedisService) {}

    // API để lưu một key vào Redis
    /**
     * @returns {Promise<string>} - Message indicating the key was set in Redis
     */
    @Get('set')
    async setKey(): Promise<string> {
        await this.redisService.set('myKey', { example: 'value' }, 5); // Lưu key với TTL 5 giây

        return 'Key set in Redis';
    }

    // API để lấy giá trị từ Redis
    /**
     * @returns {Promise<any>} - Value stored in Redis
     */
    @Get()
    async getAllKey(): Promise<any> {
        // const value = await this.redisService.flushAll;
        return await this.redisService.getAllKeysAndValues();
    }

    // API để lấy giá trị từ Redis
    /**
     * @param {string} key - Redis key
     * @returns {Promise<any>} - Value stored in Redis
     */
    @Get('get:key')
    async getKey(@Param('key') key: string): Promise<any> {
        // const value = await this.redisService.flushAll;
        const value = await this.redisService.get(key);

        return value ? value : 'Key not found';
    }
}
