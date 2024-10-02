import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

import { I18nTranslations } from '@i18n/i18n.generated';

/**
 * @class SendRestPasswordDto
 * Data transfer object for sending reset password email.
 */
export class SendRestPasswordDto {
    @IsString({
        message: i18nValidationMessage<I18nTranslations>('auth.validation.sendRestPasswordDto.email.isString'),
    })
    @IsNotEmpty({
        message: i18nValidationMessage<I18nTranslations>('auth.validation.sendRestPasswordDto.email.isNotEmpty'),
    })
    @ApiProperty({
        description: 'The email of the user',
        example: 'user@example.com',
    })
    email: string;
}
