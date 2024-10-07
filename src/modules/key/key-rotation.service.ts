// key-rotation.service.ts
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { KeyType } from '@/common';
import { KeyService } from '@modules/key/key.service';

/**
 * @class KeyRotationService
 * @description The key rotation service that handles the key rotation cron job
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
        await this.keyService.addKeyPair(KeyType.ACCESS_KEY);
        await this.keyService.addKeyPair(KeyType.REFRESH_KEY);
        await this.keyService.addKeyPair(KeyType.CONFIRMATION_USER_KEY);
        await this.keyService.addKeyPair(KeyType.RESET_PASSWORD_KEY);
        await this.keyService.removeOldKeys(KeyType.ACCESS_KEY, 31);
        await this.keyService.removeOldKeys(KeyType.REFRESH_KEY, 61);
        await this.keyService.removeOldKeys(KeyType.CONFIRMATION_USER_KEY, 31);
        await this.keyService.removeOldKeys(KeyType.RESET_PASSWORD_KEY, 31);
        console.log('Key Rotation hoàn tất.');
    }
}
