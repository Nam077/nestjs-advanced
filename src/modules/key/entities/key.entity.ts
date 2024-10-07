import { Column, Entity } from 'typeorm';

import { BaseEntityCustom, KeyType } from '@/common';

/**
 * Entity để lưu thông tin về các khóa công khai và bí mật.
 */
@Entity({
    name: 'keys',
    orderBy: {
        id: 'ASC',
    },
})
export class Key extends BaseEntityCustom {
    @Column({
        name: 'encrypted_private_key',
        type: 'bytea',
        nullable: false,
        comment: 'Encrypted private key stored in binary format',
    })
    encryptedPrivateKey: Buffer;

    @Column({
        name: 'public_key',
        type: 'text',
        nullable: false,
        comment: 'Public key used for verifying JWT',
    })
    publicKey: string;

    @Column({
        name: 'type',
        type: 'enum',
        enum: KeyType,
        default: KeyType.ACCESS_KEY,
        nullable: false,
        comment: `Type of the key`,
    })
    type: KeyType;

    @Column({
        name: 'is_active',
        type: 'boolean',
        default: true,
        comment: `Status of the key`,
    })
    isActive: boolean;
}
