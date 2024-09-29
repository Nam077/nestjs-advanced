import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
    AcceptLanguageResolver,
    HeaderResolver,
    I18nModule,
    I18nOptionsWithoutResolvers,
    QueryResolver,
} from 'nestjs-i18n';
import { join } from 'path';

/**
 * Module for i18n
 */
@Module({
    imports: [
        I18nModule.forRootAsync({
            /**
             * The function to provide the configuration.
             * @param {ConfigService} configService - The configuration service.
             * @returns {Promise<I18nOptionsWithoutResolvers>} The configuration.
             */
            useFactory: (configService: ConfigService): I18nOptionsWithoutResolvers => ({
                fallbackLanguage: configService.get('FALLBACK_LANGUAGE'),
                fallbacks: {
                    'en-US': 'en',
                    'vi-VN': 'vi',
                },
                loaderOptions: {
                    path: join(__dirname, '../../i18n/'),
                    watch: true,
                },

                typesOutputPath: join(__dirname, '../../../src/modules/i18n/i18n.generated.ts'),
            }),
            resolvers: [
                new HeaderResolver(['x-custom-lang']),
                new QueryResolver(['lang']),
                new AcceptLanguageResolver(),
            ],
            inject: [ConfigService],
        }),
    ],
    providers: [],
    exports: [],
})
export class I18nModuleLocal {}
