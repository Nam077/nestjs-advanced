import { ApiPropertyOptional } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { OrderDirection } from '@src/common';

/**
 * Cursor pagination data transfer object.
 */
export abstract class CursorPaginationDtoBase {
    @ApiPropertyOptional({ description: 'Cursor for pagination' })
    @IsOptional()
    @IsString()
    cursor?: string;

    @ApiPropertyOptional({ description: 'Limit of items per page', default: 10 })
    @IsOptional()
    @Type(() => Number)
    limit?: number = 10;

    @ApiPropertyOptional({ description: 'Search term' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ description: 'Order direction', enum: OrderDirection, default: OrderDirection.ASC })
    @IsOptional()
    @IsEnum(OrderDirection)
    orderDirection?: OrderDirection = OrderDirection.ASC;
}
