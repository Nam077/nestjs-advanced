import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString } from 'class-validator';

/**
 * The DTO for sending a reset password email
 */
export class SendRestPasswordDto {
    @IsString({ message: 'Email must be a string' })
    @IsNotEmpty({ message: 'Email should not be empty' })
    @ApiProperty({
        description: 'The email of the user',
        example: 'user@example.com',
    })
    email: string;
}
