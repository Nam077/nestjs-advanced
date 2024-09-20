import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

import { AppModule } from './app.module';
import { setupSwagger } from './common';

/**
 * Bootstrap the NestJS application
 */
async function bootstrap() {
    // Create the NestJS application instance
    const app = await NestFactory.create(AppModule);

    // Use Helmet for security headers
    app.use(helmet());

    // Enable API versioning
    app.enableVersioning({
        type: VersioningType.URI,
    });

    // Use cookie parser middleware
    app.use(cookieParser());

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

    // Start the application and listen on port 3000
    await app.listen(3000);
}

// Bootstrap the application
(async () => {
    await bootstrap();
})();
