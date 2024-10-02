import { ApiPropertyOptional } from '@nestjs/swagger';

import { IsEnum, IsIn, IsOptional } from 'class-validator';

import { PaginationDtoBase } from '@src/common';

export enum UserEnumSerchFields {
    ID = 'id',
    EMAIL = 'email',
    ROLE = 'role',
    NAME = 'name',
    CREATED_AT = 'createdAt',
    UPDATED_AT = 'updatedAt',
}

/**
 * User pagination data transfer object.
 */
/**
 * @description Data Transfer Object for user pagination.
 * @property {string} [orderBy] - Order by field.
 */
export class UserPaginationDto extends PaginationDtoBase {
    @ApiPropertyOptional({ description: 'Order by field', enum: UserEnumSerchFields })
    @IsOptional()
    @IsEnum(UserEnumSerchFields)
    @IsIn(Object.values(UserEnumSerchFields))
    orderBy?: string;
}
