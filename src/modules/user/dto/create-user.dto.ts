import { ApiProperty } from '@nestjs/swagger';

import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

import { UserRole, UserStatus } from '../../../common';
import { I18nTranslations } from '../../i18n/i18n.generated';
/**
 * @description DTO for creating a new user
 */
export class CreateUserDto {
    @ApiProperty({
        description: 'Name of the user',
        example: 'John Doe',
    })
    @IsString({ message: i18nValidationMessage<I18nTranslations>('user.validation.name.isString') })
    @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('user.validation.name.isNotEmpty') })
    name: string;

    @ApiProperty({
        description: 'Email of the user',
        example: 'user@example.com',
    })
    @IsEmail({}, { message: i18nValidationMessage<I18nTranslations>('user.validation.email.isEmail') })
    @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('user.validation.email.isNotEmpty') })
    email: string;

    @ApiProperty({
        description: 'Password of the user',
        example: 'P@ssw0rd!',
        minLength: 6,
    })
    @IsString({ message: i18nValidationMessage<I18nTranslations>('user.validation.password.isString') })
    @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('user.validation.password.isNotEmpty') })
    @MinLength(6, { message: i18nValidationMessage<I18nTranslations>('user.validation.password.minLength') })
    password: string;

    @ApiProperty({
        description: 'Role of the user',
        example: UserRole.USER,
        enum: UserRole,
    })
    @IsEnum(UserRole, { message: i18nValidationMessage<I18nTranslations>('user.validation.role.isEnum') })
    @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('user.validation.role.isNotEmpty') })
    role: UserRole;

    @ApiProperty({
        description: 'Status of the user',
        example: UserStatus.ACTIVE,
        enum: UserStatus,
    })
    @IsEnum(UserStatus, { message: i18nValidationMessage<I18nTranslations>('user.validation.status.isEnum') })
    @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('user.validation.status.isNotEmpty') })
    status? = UserStatus.ACTIVE;
}
