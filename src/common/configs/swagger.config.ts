import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/**
 *
 * @param {INestApplication} app - The Nest application instance.
 */
export function setupSwagger(app: INestApplication): void {
    const options = new DocumentBuilder()
        .setTitle('API Documentation')
        .setDescription('The API description')
        .setVersion('1.0')
        .addTag('api')
        .addBearerAuth()
        .addApiKey({
            type: 'apiKey',
            name: 'X-API-Key',
            in: 'header',
        })

        .build();

    const document = SwaggerModule.createDocument(app, options);

    SwaggerModule.setup('api', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
        },
        customSiteTitle: 'API Documentation',
    });
}
