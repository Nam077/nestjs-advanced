import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CacheModule } from './modules/cache/cache.module';
import { DatabaseModule } from './modules/database/database.module';
import { WinstonModuleConfig } from './modules/winston/winston.module';

/**
 *
 */
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: [`.env.${process.env.NODE_ENV}.local`, `.env`],
        }),
        DatabaseModule,
        CacheModule,
        WinstonModuleConfig,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
