import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtServiceLocal } from './jwt.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { KeyModule } from '../key/key.module';
import { UserModule } from '../user/user.module';
import { RefreshStrategy } from './strategies/refresh.strategy';

/**
 *
 */
@Module({
    imports: [UserModule, JwtModule.register({}), ConfigModule.forRoot({}), KeyModule],
    providers: [AuthService, JwtServiceLocal, JwtStrategy, RefreshStrategy],
    controllers: [AuthController],
})
export class AuthModule {}
