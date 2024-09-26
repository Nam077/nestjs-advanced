/* eslint-disable security/detect-object-injection */
import { Injectable } from '@nestjs/common';

import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

/**
 *
 */
@Injectable()
export class RedisService {
    /**
     *
     * @param {Redis} redis - The Redis instance
     */
    constructor(@InjectRedis() private readonly redis: Redis) {}

    /**
     * Set a key-value pair in Redis
     * @template T - The type of the value
     * @param {string} key - Redis key
     * @param {T} value - Redis value
     * @param {number} [ttl] - Time to live (optional)
     */
    async set<T>(key: string, value: T, ttl?: number): Promise<void> {
        const stringValue = JSON.stringify(value); // Chuyển value thành chuỗi JSON để lưu vào Redis

        if (ttl) {
            await this.redis.set(key, stringValue, 'EX', ttl); // Đặt TTL (thời gian sống)
        } else {
            await this.redis.set(key, stringValue); // Nếu không có TTL, chỉ lưu key và giá trị
        }
    }

    /**
     * Get a value by key from Redis
     * @param {string} key - Redis key
     * @template T - The type of the value
     * @returns {Promise<T>} - The value
     */
    async get<T>(key: string): Promise<T> {
        const value = await this.redis.get(key);

        return value ? JSON.parse(value) : null;
    }

    /**
     * Delete a key from Redis
     * @param {string} key - Redis key
     */
    async del(key: string): Promise<void> {
        await this.redis.del(key);
    }

    /**
     * Check if a key exists in Redis
     * @param {string} key - Redis key
     * @returns {Promise<boolean>} - Whether the key exists
     */
    async exists(key: string): Promise<boolean> {
        const result = await this.redis.exists(key);

        return result === 1;
    }

    /**
     * Flush all Redis data (use with caution)
     */
    async flushAll(): Promise<void> {
        await this.redis.flushall();
    }

    /**
     * Get all keys and their corresponding values from Redis
     * @returns {Promise<any>} - All keys and values
     */
    async getAllKeysAndValues(): Promise<any> {
        let cursor = '0';
        const allData = {};

        do {
            // `SCAN` với cursor và lấy một phần của các key
            const [newCursor, keys] = await this.redis.scan(cursor);

            cursor = newCursor;

            // Lấy giá trị của các key đã tìm được
            if (keys.length > 0) {
                const values = await this.redis.mget(...keys); // Lấy giá trị của các key đã quét

                for (let i = 0; i < keys.length; i++) {
                    const ttl = await this.redis.ttl(keys[i]); // Lấy TTL của mỗi key

                    allData[keys[i]] = {
                        value: values[i], // Giá trị của key
                        ttl, // TTL của key (thời gian sống còn lại)
                    };
                }
            }
        } while (cursor !== '0'); // Tiếp tục quét cho đến khi cursor bằng '0'

        return allData;
    }

    /**
     * @template T - The type of the value
     * @param {string} key - Redis key
     * @param {T} value - Redis value
     * @param {number} [ttl] - Time to live (optional)
     */
    async update<T>(key: string, value: T, ttl?: number): Promise<void> {
        const stringValue = JSON.stringify(value); // Chuyển value thành chuỗi JSON để lưu vào Redis

        await this.redis.set(key, stringValue, 'EX', ttl); // Đặt TTL (thời gian sống)
    }
}
