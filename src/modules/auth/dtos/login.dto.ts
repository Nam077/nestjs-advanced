import { ApiProperty } from '@nestjs/swagger';

import { IsString, IsNotEmpty } from 'class-validator';

/**
 * @class LoginDto
 * Data transfer object for the login endpoint.
 */
export class LoginDto {
    @IsString({ message: 'Email must be a string' })
    @IsNotEmpty({ message: 'Email should not be empty' })
    @ApiProperty({
        description: 'The email of the user',
        example: 'user@example.com',
    })
    email: string;

    @IsString({ message: 'Password must be a string' })
    @IsNotEmpty({ message: 'Password should not be empty' })
    @ApiProperty({
        description: 'The password of the user',
        example: 'P@ssw0rd!',
    })
    password: string;
}
