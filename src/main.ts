import { VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

// eslint-disable-next-line import/no-named-as-default
import fastifyCookie, { FastifyCookieOptions } from '@fastify/cookie';
import * as compression from 'compression';
import helmet from 'helmet';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { I18nValidationPipe } from 'nestjs-i18n';
import * as os from 'os';

import { AppModule } from '@src/app.module';
import { setupSwagger } from '@src/common';

/**
 * Bootstrap the NestJS application
 */
async function bootstrap() {
    // Create the NestJS application instance using Fastify
    const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter({}));
    const configService: ConfigService = app.get(ConfigService);
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

    // Use cookie parser middleware
    await app.register<FastifyCookieOptions>(fastifyCookie, {
        secret: configService.get<string>('COOKIE_SECRET'),
    });
    // Use compression middleware
    app.use(compression());

    // Use Winston logger
    app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

    // Use global validation pipes
    app.useGlobalPipes(
        new I18nValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
        }),
    );
    // Enable CORS
    app.enableCors();

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
