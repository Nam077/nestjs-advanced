import { ApiProperty } from '@nestjs/swagger';

import { IsString, IsNotEmpty } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

import { I18nTranslations } from '../../i18n/i18n.generated';
/**
/**
 * @class LoginDto
 * Data transfer object for the login endpoint.
 */
export class LoginDto {
    @IsString({ message: i18nValidationMessage<I18nTranslations>('auth.validation.loginDto.email.isString') })
    @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('auth.validation.loginDto.email.isNotEmpty') })
    @ApiProperty({
        description: 'The email of the user',
        example: 'user@example.com',
    })
    email: string;

    @IsString({ message: i18nValidationMessage<I18nTranslations>('auth.validation.loginDto.password.isString') })
    @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('auth.validation.loginDto.password.isNotEmpty') })
    @ApiProperty({
        description: 'The password of the user',
        example: 'P@ssw0rd!',
    })
    password: string;
}
