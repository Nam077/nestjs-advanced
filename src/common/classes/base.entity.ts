import { PrimaryGeneratedColumn, UpdateDateColumn, CreateDateColumn, DeleteDateColumn } from 'typeorm';

/**
 * @description Base entity class for all entities
 */
export abstract class BaseEntityCustom {
    @PrimaryGeneratedColumn('uuid', { name: 'id', comment: `Unique identifier of the entity` })
    id: string;

    @CreateDateColumn({ name: 'created_at', comment: `Date of creation of the entity` })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', comment: `Date of the last update of the entity` })
    updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at', comment: `Date of deletion of the entity` })
    deletedAt: Date;
}
