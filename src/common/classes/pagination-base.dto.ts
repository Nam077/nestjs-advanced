import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, Max, Min } from 'class-validator';

import { OrderDirection } from '../enums';

const LIMIT = {
    MAX: 100,
    MIN: 1,
};

const PAGE = {
    MIN: 1,
};

/**
 * Pagination data transfer object.
 */
export abstract class PaginationDtoBase {
    @Type(() => Number)
    @Min(PAGE.MIN)
    @ApiProperty({ type: Number, default: PAGE.MIN, description: 'Page number' })
    page: number = PAGE.MIN;

    @IsOptional()
    @Type(() => Number)
    @Min(LIMIT.MIN)
    @Max(LIMIT.MAX)
    @ApiProperty({ type: Number, default: LIMIT.MIN, description: 'Items per page' })
    limit: number = LIMIT.MIN;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional({ type: String, description: 'Search query' })
    search?: string;

    @IsOptional()
    @IsEnum(OrderDirection)
    @ApiPropertyOptional({ enum: OrderDirection, default: OrderDirection.ASC, description: 'Order direction' })
    order?: OrderDirection = OrderDirection.ASC;
}
