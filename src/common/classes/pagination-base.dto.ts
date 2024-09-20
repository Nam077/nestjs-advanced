import { ApiPropertyOptional } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { IsOptional, IsString, IsEnum } from 'class-validator';

import { OrderDirection } from '../enums';

/**
 * Pagination data transfer object.
 */
export abstract class PaginationDto {
    @IsOptional()
    @Type(() => Number)
    @ApiPropertyOptional({ type: Number, default: 1, description: 'Page number' })
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @ApiPropertyOptional({ type: Number, default: 10, description: 'Number of items per page' })
    limit?: number = 10;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional({ type: String, description: 'Search query' })
    search?: string;

    @IsOptional()
    @IsEnum(OrderDirection)
    @ApiPropertyOptional({ enum: OrderDirection, default: OrderDirection.ASC, description: 'Order direction' })
    orderDirection?: OrderDirection = OrderDirection.ASC;
}
