import { ApiProperty } from '@nestjs/swagger';

import { IsUUID } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

import { I18nTranslations } from '../../i18n/i18n.generated';

/**
 * @class LogoutSessionsDto
 * Data transfer object for the logout multiple sessions endpoint.
 */
export class LogoutSessionsDto {
    @IsUUID('4', {
        each: true,
        message: i18nValidationMessage<I18nTranslations>('auth.validation.logoutSessionsDto.sessionIds.isUUID'),
    })
    @ApiProperty({
        type: 'array',
        items: {
            type: 'string',
            format: 'uuid',
        },
        example: ['123e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174001'],
    })
    sessionIds: string[];
}
