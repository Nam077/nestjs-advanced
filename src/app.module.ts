import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './modules/database/database.module';
import { CacheModule } from './modules/cache/cache.module';

@Module({
  imports: [DatabaseModule, CacheModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
