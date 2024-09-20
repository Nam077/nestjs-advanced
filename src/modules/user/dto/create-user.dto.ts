import { ApiProperty } from '@nestjs/swagger';

import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';

import { UserRole } from '../../../common';

/**
 * @description DTO for creating a new user
 */
export class CreateUserDto {
    @ApiProperty({
        description: 'Name of the user',
        example: 'John Doe',
    })
    @IsString({ message: 'Name must be a string' })
    @IsNotEmpty({ message: 'Name is required' })
    name: string;

    @ApiProperty({
        description: 'Email of the user',
        example: 'user@example.com',
    })
    @IsEmail({}, { message: 'Invalid email format' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;

    @ApiProperty({
        description: 'Password of the user',
        example: 'P@ssw0rd!',
        minLength: 6,
    })
    @IsString({ message: 'Password must be a string' })
    @IsNotEmpty({ message: 'Password is required' })
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    password: string;

    @ApiProperty({
        description: 'Role of the user',
        example: UserRole.USER,
        enum: UserRole,
    })
    @IsEnum(UserRole, { message: 'Invalid user role' })
    @IsNotEmpty({ message: 'Role is required' })
    role: UserRole;
}
