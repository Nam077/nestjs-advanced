import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Key } from '@modules/key/entities/key.entity';
import { KeyRotationService } from '@modules/key/key-rotation.service';
import { KeyService } from '@modules/key/key.service';

/**
 * @class KeyModule Handles the key module
 */
@Module({
    imports: [TypeOrmModule.forFeature([Key]), ConfigModule.forRoot(), JwtModule.register({})],
    providers: [KeyService, KeyRotationService],
    exports: [KeyService],
})
export class KeyModule {}
