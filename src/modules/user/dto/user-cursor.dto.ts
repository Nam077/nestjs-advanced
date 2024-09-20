import { ApiPropertyOptional } from '@nestjs/swagger';

import { IsOptional, IsIn, IsEnum } from 'class-validator';

import { UserEnumSerchFields } from './user-pagination.dto';
import { CursorPaginationDtoBase } from '../../../common/classes';

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
