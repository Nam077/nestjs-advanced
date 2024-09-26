import { ApiProperty } from '@nestjs/swagger';

import { IsUUID } from 'class-validator';
/**
 *
 */
export class LogoutSessionsDto {
    @ApiProperty({
        type: 'array',
        items: {
            type: 'string',
            format: 'uuid',
        },
        example: ['123e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174001'],
    })
    @IsUUID('4', { each: true })
    sessionIds: string[];
}
