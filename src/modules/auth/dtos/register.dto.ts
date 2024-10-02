import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

import { I18nTranslations } from '@i18n/i18n.generated';

/**
 * @class RegisterDto
 * Data transfer object for the register endpoint.
 */
export class RegisterDto {
    @IsString({ message: i18nValidationMessage<I18nTranslations>('auth.validation.registerDto.email.isString') })
    @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('auth.validation.registerDto.email.isNotEmpty') })
    @ApiProperty({
        description: 'The email of the user',
        example: 'register@example.com',
    })
    email: string;

    @IsString({ message: i18nValidationMessage<I18nTranslations>('auth.validation.registerDto.password.isString') })
    @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('auth.validation.registerDto.password.isNotEmpty') })
    @ApiProperty({
        description: 'The password of the user',
        example: 'P@ssw0rd!',
    })
    password: string;

    @IsString({ message: i18nValidationMessage<I18nTranslations>('auth.validation.registerDto.name.isString') })
    @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('auth.validation.registerDto.name.isNotEmpty') })
    @ApiProperty({
        description: 'The name of the user',
        example: 'John Doe',
    })
    name: string;
}
