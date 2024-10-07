/* eslint-disable security/detect-object-injection */

import { Injectable } from '@nestjs/common';

import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';

/**
 *
 */
@Injectable()
export class RedisService {
    /**
     *
     * @param { Redis } redis - The Redis instance
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
        const stringValue = JSON.stringify(value);

        if (ttl) {
            if (ttl <= 0) {
                return;
            }

            await this.redis.set(key, stringValue, 'EX', ttl);
        } else {
            await this.redis.set(key, stringValue);
        }
    }

    /**
     * Get a value by key from Redis
     * @template T - The type of the value
     * @param {string} key - Redis key
     * @returns {Promise<T>} - The value
     */
    async get<T>(key: string): Promise<T> {
        const value = await this.redis.get(key);

        return value ? JSON.parse(value) : null;
    }

    /**
     *
     * @param {string} key - Redis key
     * @returns {Promise<boolean>} - Whether the key exists
     */
    async checkExist(key: string): Promise<boolean> {
        return (await this.redis.exists(key)) > 0;
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
            const [newCursor, keys] = await this.redis.scan(cursor);

            cursor = newCursor;

            if (keys.length > 0) {
                // Sử dụng MGET để lấy tất cả các giá trị của keys
                const values = await this.redis.mget(...keys);

                // Sử dụng pipeline để lấy TTL của tất cả các keys cùng lúc
                const pipeline = this.redis.pipeline();

                keys.forEach((key) => pipeline.ttl(key));
                const ttlResults = await pipeline.exec();

                for (let i = 0; i < keys.length; i++) {
                    allData[keys[i]] = {
                        value: values[i],
                        ttl: ttlResults[i][1], // Kết quả của lệnh TTL trong pipeline
                    };
                }
            }
        } while (cursor !== '0');

        return allData;
    }

    /**
     * Add an item to a Redis Set
     * @param {string} key - The Redis key for the set
     * @param {string} value - The value to add to the set
     */
    async sadd(key: string, value: string): Promise<void> {
        await this.redis.sadd(key, value);
    }

    /**
     * Check if a member exists in a Redis Set
     * @param {string} key - The Redis key for the set
     * @param {string} member - The member to check for
     * @returns {Promise<boolean>} - Whether the member exists in the set
     */
    async sismember(key: string, member: string): Promise<boolean> {
        const result = await this.redis.sismember(key, member);

        return result === 1;
    }

    /**
     * Remove an item from a Redis Set
     * @param {string} key - The Redis key for the set
     * @param {string} member - The member to remove
     */
    async srem(key: string, member: string): Promise<void> {
        await this.redis.srem(key, member);
    }

    /**
     * Get all members of a Redis Set
     * @param {string} key - The Redis key for the set
     * @returns {Promise<string[]>} - All members of the set
     */
    async smembers(key: string): Promise<string[]> {
        return this.redis.smembers(key);
    }

    /**
     * Add an item to a Redis List (Push to List)
     * @param {string} key - The Redis key for the list
     * @param {string} value - The value to push
     */
    async lpush(key: string, value: string): Promise<void> {
        await this.redis.lpush(key, value);
    }

    /**
     * Remove and get the first element in a Redis List
     * @param {string} key - The Redis key for the list
     * @returns {Promise<string>} The first element in the list
     */
    async lpop(key: string): Promise<string> {
        return this.redis.lpop(key);
    }

    /**
     * Get all items from a Redis List
     * @param {string} key - The Redis key for the list
     * @param {number} start - The start index (default is 0)
     * @param {number} stop - The stop index (default is -1 for all)
     * @returns {Promise<string[]>} - All items in the list
     */
    async lrange(key: string, start: number = 0, stop: number = -1): Promise<string[]> {
        return this.redis.lrange(key, start, stop);
    }

    /**
     * Set a TTL (Time to Live) for a specific key
     * @param {string} key - The Redis key
     * @param {number} ttl - Time to live in seconds
     */
    async expire(key: string, ttl: number): Promise<void> {
        await this.redis.expire(key, ttl);
    }

    /**
     * Get the TTL of a key
     * @param {string} key - The Redis key
     * @returns {Promise<number>} The time to live in seconds
     */
    async ttl(key: string): Promise<number> {
        return this.redis.ttl(key);
    }

    /**
     * Increment the value of a key by a given amount
     * @param {string} key - The Redis key
     * @param {number} increment - The amount to increment by
     */
    async incrby(key: string, increment: number): Promise<void> {
        await this.redis.incrby(key, increment);
    }

    /**
     * Sử dụng pipeline để lấy tất cả các session cùng một lúc
     * @returns {any} - The pipeline
     */
    pipeline(): any {
        return this.redis.pipeline();
    }
}
