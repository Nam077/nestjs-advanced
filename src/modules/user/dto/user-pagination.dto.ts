import { ApiPropertyOptional } from '@nestjs/swagger';

import { IsEnum, IsIn, IsOptional } from 'class-validator';

import { PaginationDto } from '../../../common';

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
 * @augments PaginationDto
 * @property {string} [orderBy] - Order by field.
 */
export class UserPaginationDto extends PaginationDto {
    @ApiPropertyOptional({ description: 'Order by field', enum: UserEnumSerchFields })
    @IsOptional()
    @IsEnum(UserEnumSerchFields)
    @IsIn(Object.values(UserEnumSerchFields))
    orderBy?: string;
}
