import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';

import { AES, lib, enc } from 'crypto-js';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston/dist/winston.constants';
import { LessThan } from 'typeorm';
import { Repository } from 'typeorm/repository/Repository';
import { Logger } from 'winston';

import { Key } from './entities/key.entity';
import { KeyType } from '../../common';

/**
 *
 */
@Injectable()
export class KeyService {
    private isKeyBeingCreated = false; // Flag to prevent multiple keys from being created concurrently.

    /**
     *
     * @param {Repository<Key>} keyRepository - The key repository
     * @param {ConfigService} configService - The config service
     * @param {Logger} logger - The logger
     */
    constructor(
        @InjectRepository(Key)
        private readonly keyRepository: Repository<Key>,
        private readonly configService: ConfigService,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    ) {}

    /**
     * Encrypts the key with the master key.
     * @param {string} key - The key to encrypt
     * @returns {string} The encrypted key
     */
    encryptKey(key: string): string {
        return AES.encrypt(key, this.configService.get('MASTER_KEY')).toString();
    }

    /**
     * Decrypts the key with the master key.
     * @param {string} encryptedKey - The key to decrypt
     * @returns {string} The decrypted key
     */
    decryptKey(encryptedKey: Buffer): string {
        const encryptedKeyStr = encryptedKey.toString('base64'); // Chuyển đổi từ Buffer thành chuỗi

        return AES.decrypt(encryptedKeyStr, this.configService.get('MASTER_KEY')).toString(enc.Utf8);
    }

    /**
     * Retrieves a key by its ID.
     * @param {string} id - The key ID
     * @returns {Promise<Key>} The key entity
     */
    async getKeyById(id: string): Promise<Key> {
        return this.keyRepository.findOne({ where: { id } });
    }

    /**
     * Retrieves the secret key by its ID.
     * @param {string} id - The key ID
     * @returns {Promise<string>} The decrypted key
     */
    async getSecretKeyById(id: string): Promise<string> {
        const key = await this.getKeyById(id);

        if (!key) {
            this.logger.error(`Key not found: ${id}`);
            throw new Error('Key not found');
        }

        return this.decryptKey(key.encryptedKey);
    }

    /**
     * Adds a new key to the database.
     * @param {KeyType} keyType - The type of the key
     */
    async addKey(keyType: KeyType): Promise<void> {
        // Prevent multiple concurrent key creations
        if (this.isKeyBeingCreated) {
            this.logger.warn(`Key creation already in progress for type: ${keyType}`);

            return;
        }

        this.isKeyBeingCreated = true;

        try {
            const newKey = lib.WordArray.random(16).toString();
            const encryptedKey = this.encryptKey(newKey);

            const key = new Key();

            key.encryptedKey = Buffer.from(encryptedKey, 'base64');
            key.type = keyType;

            await this.keyRepository.save(key);

            this.logger.info(`Added new ${keyType} key`);
        } catch (error) {
            this.logger.error(`Error while adding ${keyType} key: ${error.message}`);
        } finally {
            this.isKeyBeingCreated = false; // Reset the flag
        }
    }

    /**
     * Removes old keys from the database.
     * @param {KeyType} keyType - The type of the key
     * @param {number} retentionDays - The number of days to retain the keys
     * @returns {Promise<void>} Promise when keys are removed
     */
    async removeOldKeys(keyType: KeyType, retentionDays: number): Promise<void> {
        const retentionDate = new Date();

        retentionDate.setDate(retentionDate.getDate() - retentionDays);

        await this.keyRepository.delete({
            type: keyType,
            createdAt: LessThan(retentionDate),
        });

        this.logger.info(`Deleted old ${keyType} keys before date: ${retentionDate}`);
    }

    /**
     * Retrieves the current key for the given type.
     * @param {KeyType} keyType - The type of the key
     * @returns {Promise<Key>} The current key
     */
    async getCurrentKey(keyType: KeyType): Promise<Key> {
        return this.keyRepository.findOne({
            where: { type: keyType },
            order: { createdAt: 'DESC' },
        });
    }

    /**
     * Retrieves the current secret key, and adds a new one if none exists.
     * @param {KeyType} keyType - The type of the key
     * @returns {Promise<Key & { key: string }>} The current key with its decrypted value
     */
    async getCurrentSecretKey(keyType: KeyType): Promise<Key & { key: string }> {
        let key = await this.getCurrentKey(keyType);

        // If no key exists, create one
        if (!key) {
            await this.addKey(keyType);
            key = await this.getCurrentKey(keyType); // Get the newly created key
        }

        // If key creation still fails, throw an error
        if (!key) {
            throw new Error(`Failed to create or retrieve key for ${keyType}`);
        }

        return {
            ...key,
            key: this.decryptKey(key.encryptedKey),
        };
    }
}
