import { ApiPropertyOptional } from '@nestjs/swagger';

import { IsEnum, IsIn, IsOptional } from 'class-validator';

import { CursorPaginationDtoBase } from '@src/common';

import { UserEnumSerchFields } from './user-pagination.dto';

/**
 *
 */
export class UserCursorDto extends CursorPaginationDtoBase {
    @ApiPropertyOptional({ description: 'Order by field', enum: UserEnumSerchFields })
    @IsOptional()
    @IsEnum(UserEnumSerchFields)
    @IsIn(Object.values(UserEnumSerchFields))
    orderBy?: string;
}
