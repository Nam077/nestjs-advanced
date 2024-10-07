import { ApiPropertyOptional } from '@nestjs/swagger';

import { IsEnum, IsIn, IsOptional } from 'class-validator';

import { CursorPaginationDtoBase } from '@/common';
import { UserEnumSearchFields } from '@modules/user/dto/user-pagination.dto';

/**
 *
 */
export class UserCursorDto extends CursorPaginationDtoBase {
    @ApiPropertyOptional({ description: 'Order by field', enum: UserEnumSearchFields })
    @IsOptional()
    @IsEnum(UserEnumSearchFields)
    @IsIn(Object.values(UserEnumSearchFields))
    orderBy?: string;
}
