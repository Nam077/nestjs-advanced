import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString } from 'class-validator';

import { IsMatch } from '../../../common';

/**
 *
 */
export class ResetPasswordDto {
    @IsString({ message: 'Password must be a string' })
    @IsNotEmpty({ message: 'Password should not be empty' })
    @ApiProperty({
        description: 'The new password of the user',
        example: 'password',
    })
    password: string;

    @IsString({ message: 'Password must be a string' })
    @IsNotEmpty({ message: 'Password should not be empty' })
    @IsMatch('password', { message: 'Passwords do not match' })
    @ApiProperty({
        description: 'The new password of the user',
        example: 'password',
    })
    confirmPassword: string;
}
