import { Column, Entity, Index } from 'typeorm';

import { BaseEntityCustom, UserRole, hashServiceInstance } from '../../../common';

/**
 * @description User entity class for handling user data
 */
@Entity({
    name: 'users',
    orderBy: {
        id: 'ASC',
    },
})
export class User extends BaseEntityCustom {
    @Index()
    @Column({
        name: 'email',
        type: 'varchar',
        length: 255,
        nullable: false,
        unique: true,
        comment: `Email of the user`,
    })
    email: string;

    @Column({
        name: 'password',
        type: 'text',
        nullable: false,
        comment: `Password of the user`,
        select: false,
    })
    password: string;

    @Column({
        name: 'name',
        type: 'varchar',
        length: 255,
        nullable: false,
        comment: `Name of the user`,
    })
    name: string;

    @Column({
        name: 'role',
        type: 'enum',
        enum: UserRole,
        default: UserRole.USER,
        nullable: false,
        comment: `Role of the user`,
    })
    role: UserRole;

    //relationship

    // funtion

    /**
     * @param {string} password - Password to compare
     * @returns {boolean} - Comparison result
     */
    comparePassword(password: string): boolean {
        return hashServiceInstance.compare(password, this.password);
    }

    /**
     * Hash the password
     */
    hashPassword(): void {
        this.password = hashServiceInstance.hash(this.password);
    }
}
