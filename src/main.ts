import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
// eslint-disable-next-line import/no-named-as-default
import helmet from 'helmet';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { I18nValidationExceptionFilter, I18nValidationPipe } from 'nestjs-i18n';
import * as os from 'os';

import { AppModule } from '@/app.module';
import { setupSwagger } from '@/common';

import { AuthService } from './modules/auth/auth.service';

/**
 * Bootstrap the NestJS application
 */
async function bootstrap() {
    // Create the NestJS application instance using Fastify
    const app = await NestFactory.create(AppModule);
    const configService: ConfigService = app.get(ConfigService);
    const authService: AuthService = app.get(AuthService);
    const PORT = configService.get<number>('APP_PORT', 3000);

    // Use Helmet for security headers
    app.use(
        helmet({
            contentSecurityPolicy: false,
        }),
    );

    // Enable API versioning
    app.enableVersioning({
        type: VersioningType.URI,
    });
    ///
    // Use cookie parser middleware
    app.use(cookieParser());

    // Use compression middleware
    app.use(compression());

    // Use Winston logger
    app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
        }),
    );

    app.useGlobalPipes(new I18nValidationPipe());
    app.useGlobalFilters(
        new I18nValidationExceptionFilter({
            errorHttpStatusCode: 422,
        }),
    );
    const acceptHost = await authService.getAcceptHost();

    console.log('acceptHost', acceptHost);

    // Enable CORS
    app.enableCors({
        origin: acceptHost,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        preflightContinue: false,
        optionsSuccessStatus: 204,
        credentials: true,
    });

    // Setup Swagger documentation
    setupSwagger(app);

    const networkInterfaces = os.networkInterfaces();

    const localIp = Object.values(networkInterfaces)
        .flat()
        .find((iface) => iface?.family === 'IPv4' && !iface.internal)?.address;

    // Start the application and listen on the specified port and address
    await app.listen(PORT, '0.0.0.0');
    console.log(`Application is running on: ${await app.getUrl()}\nLocal IP: http://${localIp}:${PORT}`);
}

// Bootstrap the application
(async () => {
    await bootstrap();
})();
