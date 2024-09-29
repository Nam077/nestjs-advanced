import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { I18nOptionsFactory, I18nOptionsWithoutResolvers } from 'nestjs-i18n';
import { join } from 'path';

/**
 *
 */
@Injectable()
export class I18nConfigService implements I18nOptionsFactory {
    /**
     *
     * @param {ConfigService} configService - The configuration service
     */
    constructor(private readonly configService: ConfigService) {}
    /**
     * Create the i18n options.
     * @returns {I18nOptionsWithoutResolvers} The i18n options
     */
    createI18nOptions(): I18nOptionsWithoutResolvers {
        return {
            fallbackLanguage: this.configService.get('FALLBACK_LANGUAGE'),
            fallbacks: {
                'en-US': 'en',
                'vi-VN': 'vi',
            },
            loaderOptions: {
                path: join(__dirname, '../../i18n/'),
                watch: true,
            },

            typesOutputPath: join(__dirname, '../../../src/i18n/i18n.generated.ts'),
        };
    }
}
