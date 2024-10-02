import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

import { I18nTranslations } from '@i18n/i18n.generated';

/**
 * @class TokenDto
 * Data transfer object for providing token.
 */
export class TokenDto {
    @IsString({ message: i18nValidationMessage<I18nTranslations>('auth.validation.tokenDto.token.isString') })
    @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('auth.validation.tokenDto.token.isNotEmpty') })
    @ApiProperty({
        description: 'The token',
        example:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    })
    token: string;
}
