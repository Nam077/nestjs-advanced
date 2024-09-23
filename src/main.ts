import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

import fastifyCookie from '@fastify/cookie';
import * as compression from 'compression';
import helmet from 'helmet';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

import { AppModule } from './app.module';
import { setupSwagger } from './common';

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
    await app.register(fastifyCookie, {
        secret: 'my-secret',
    });
    // Use compression middleware
    app.use(compression());

    // Use Winston logger
    app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

    // Use global validation pipes
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
        }),
    );

    // Setup Swagger documentation
    setupSwagger(app);

    // Start the application and listen on the specified port and address
    await app.listen(PORT, '0.0.0.0');
    console.log(`Application is running on: ${await app.getUrl()}`);
}

// Bootstrap the application
(async () => {
    await bootstrap();
})();
