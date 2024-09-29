import { ApiProperty } from '@nestjs/swagger';

import { IsString, IsNotEmpty } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

import { I18nTranslations } from '../../i18n/i18n.generated';

/**
 * @class ResetPasswordDto
 * Data transfer object for resetting password.
 */
export class ResetPasswordDto {
    // @IsString({
    //     message: i18nValidationMessage<I18nTranslations>('auth.validation.resetPasswordDto.password.isString'),
    // })
    // @IsNotEmpty({
    //     message: i18nValidationMessage<I18nTranslations>('auth.validation.resetPasswordDto.password.isNotEmpty'),
    // })
    @ApiProperty({
        description: 'The new password of the user',
        example: 'password',
    })
    password: string;

    @IsString({
        message: i18nValidationMessage<I18nTranslations>('auth.validation.resetPasswordDto.confirmPassword.isString'),
    })
    @IsNotEmpty({
        message: i18nValidationMessage<I18nTranslations>('auth.validation.resetPasswordDto.confirmPassword.isNotEmpty'),
    })
    @ApiProperty({
        description: 'The confirmation of the new password',
        example: 'password',
    })
    confirmPassword: string;
}
