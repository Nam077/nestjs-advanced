import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';

import * as crypto from 'crypto';
import { AES, enc } from 'crypto-js';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { LessThan, Repository } from 'typeorm';
import { Logger } from 'winston';

import { KeyType } from '@src/common';

import { Key } from './entities/key.entity';

/**
 *
 */
@Injectable()
export class KeyService {
    private isKeyBeingCreated = false; // Flag to prevent multiple keys from being created concurrently.

    /**
     *
     * @param {Repository<Key>} keyRepository - The key repository
     * @param {ConfigService} configService - The configuration service
     * @param {Logger} logger - The logger service
     */
    constructor(
        @InjectRepository(Key)
        private readonly keyRepository: Repository<Key>,
        private readonly configService: ConfigService,
        @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
    ) {}

    /**
     * Encrypts the private key with the master key.
     * @param {string} privateKey - The private key to encrypt
     * @returns {string} The encrypted private key
     */
    encryptPrivateKey(privateKey: string): string {
        return AES.encrypt(privateKey, this.configService.get('MASTER_KEY')).toString();
    }

    /**
     * Decrypts the private key with the master key.
     * @param {Buffer} encryptedPrivateKey - The encrypted private key
     * @returns {string} The decrypted private key
     */
    decryptPrivateKey(encryptedPrivateKey: Buffer): string {
        const encryptedKeyStr = encryptedPrivateKey.toString('base64');

        return AES.decrypt(encryptedKeyStr, this.configService.get('MASTER_KEY')).toString(enc.Utf8);
    }

    /**
     * Retrieves a key by its ID.
     * @param {string} id - The key ID
     * @returns {Promise<Key>} The key entity
     */
    async getKeyById(id: string): Promise<Key> {
        if (!id) {
            this.logger.error('Key ID is required');
            throw new Error('Key ID is required');
        }

        return await this.keyRepository.findOne({ where: { id } });
    }

    /**
     * Retrieves the secret private key by its ID.
     * @param {string} id - The key ID
     * @returns {Promise<string>} The decrypted private key
     */
    async getSecretPrivateKeyById(id: string): Promise<string> {
        const key = await this.getKeyById(id);

        if (!key) {
            this.logger.error(`Key not found: ${id}`);
            throw new Error('Key not found');
        }

        return this.decryptPrivateKey(key.encryptedPrivateKey);
    }

    /**
     *
     * @param {string} id - The key ID
     * @returns {Promise<string>} The public key
     */
    async getPulicKeyById(id: string): Promise<string> {
        const key = await this.getKeyById(id);

        if (!key) {
            this.logger.error(`Key not found: ${id}`);
            throw new Error('Key not found');
        }

        return key.publicKey;
    }

    /**
     * Adds a new key pair (RSA private and public key) to the database.
     * @param {KeyType} keyType - The type of the key
     * @returns {Promise<Key>} The new key entity
     */
    async addKeyPair(keyType: KeyType): Promise<Key> {
        if (this.isKeyBeingCreated) {
            this.logger.warn(`Key creation already in progress for type: ${keyType}`);

            return;
        }

        this.isKeyBeingCreated = true;

        try {
            // Generate RSA key pair (2048-bit key size)
            const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
                modulusLength: 2048,
                publicKeyEncoding: { type: 'pkcs1', format: 'pem' },
                privateKeyEncoding: { type: 'pkcs1', format: 'pem' },
            });

            const encryptedPrivateKey = this.encryptPrivateKey(privateKey); // Mã hóa private key

            const key = new Key();

            key.encryptedPrivateKey = Buffer.from(encryptedPrivateKey, 'base64');
            key.publicKey = publicKey; // Lưu public key không mã hóa
            key.type = keyType;

            const savedKey = await this.keyRepository.save(key);

            this.logger.log(`Added new RSA key pair for ${keyType}`);

            return savedKey;
        } catch (error) {
            this.logger.error(`Error while adding RSA key pair: ${error.message}`);
        } finally {
            this.isKeyBeingCreated = false;
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

        this.logger.log(`Deleted old ${keyType} keys before date: ${retentionDate}`);
    }

    /**
     * Retrieves the current key for the given type.
     * @param {KeyType} keyType - The type of the key
     * @returns {Promise<Key>} The current key
     */
    async getCurrentKey(keyType: KeyType): Promise<Key & { decryptedPrivateKey: string }> {
        let key = await this.keyRepository.findOne({
            where: { type: keyType, isActive: true },
            order: { createdAt: 'DESC' },
        });

        if (!key) {
            key = await this.addKeyPair(keyType);
        }

        const decryptedPrivateKey = this.decryptPrivateKey(key.encryptedPrivateKey);

        return {
            ...key,
            decryptedPrivateKey,
        };
    }
}
