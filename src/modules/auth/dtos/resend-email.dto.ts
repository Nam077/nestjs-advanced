import { ApiProperty } from '@nestjs/swagger';

import { IsString, IsNotEmpty } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

import { I18nTranslations } from '../../i18n/i18n.generated';

/**
 * @class ResendEmailDto
 * Data transfer object for resending email verification.
 */
export class ResendEmailDto {
    @IsString({ message: i18nValidationMessage<I18nTranslations>('auth.validation.resendEmailDto.email.isString') })
    @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('auth.validation.resendEmailDto.email.isNotEmpty') })
    @ApiProperty({
        description: 'The email of the user',
        example: 'user@example.com',
    })
    email: string;
}
