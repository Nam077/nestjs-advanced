// key-rotation.service.ts
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { KeyService } from './key.service';
import { KeyType } from '../../common';

/**
 * @class KeyRotationService
 * @description The key rotation service that handles the key rotation cron job
 * @exports KeyRotationService
 */
@Injectable()
export class KeyRotationService {
    /**
     * @param {KeyService} keyService - The key service
     */
    constructor(private keyService: KeyService) {}

    /**
     * @description The cron job that rotates the keys every month and removes the old keys every month
     */
    @Cron('0 0 1 * *')
    async handleCron() {
        await this.keyService.addKey(KeyType.ACCESS_KEY);
        await this.keyService.addKey(KeyType.REFRESH_KEY);
        await this.keyService.removeOldKeys(KeyType.ACCESS_KEY, 31);
        await this.keyService.removeOldKeys(KeyType.REFRESH_KEY, 61);
        console.log('Key Rotation hoàn tất.');
    }
}
