import { Entity, Column } from 'typeorm';

import { BaseEntityCustom, KeyType } from '../../../common';

/**
 *
 */
@Entity({
    name: 'keys',
    orderBy: {
        id: 'ASC',
    },
})
export class Key extends BaseEntityCustom {
    @Column({
        name: 'encrypted_key',
        type: 'bytea',
        nullable: false,
        comment: 'Encrypted key stored in binary format',
    })
    encryptedKey: Buffer;

    @Column({
        name: 'type',
        type: 'enum',
        enum: KeyType,
        default: KeyType.ACCESS_KEY,
        nullable: false,
        comment: `Type of the key`,
    })
    type: KeyType;

    //status
    @Column({
        name: 'is_active',
        type: 'boolean',
        default: true,
        comment: `Status of the key`,
    })
    isActive: boolean;

    //relationship
}
