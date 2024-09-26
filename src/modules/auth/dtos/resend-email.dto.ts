import { ApiProperty } from '@nestjs/swagger';

import { IsString, IsNotEmpty } from 'class-validator';

/**
 *
 */
export class ResendEmailDto {
    @IsString({ message: 'Email must be a string' })
    @IsNotEmpty({ message: 'Email should not be empty' })
    @ApiProperty({
        description: 'The email of the user',
        example: 'user@example.com',
    })
    email: string;
}
