import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from '@modules/auth/auth.controller';
import { AuthService } from '@modules/auth/auth.service';
import { JwtServiceLocal } from '@modules/auth/jwt.service';
import { JwtStrategy } from '@modules/auth/strategies/jwt.strategy';
import { RefreshStrategy } from '@modules/auth/strategies/refresh.strategy';
import { KeyModule } from '@modules/key/key.module';
import { UserModule } from '@modules/user/user.module';

import { SessionService } from './session.service';
import { TokenCacheService } from './token-cache.service';

/**
 *
 */
@Module({
    imports: [UserModule, JwtModule.register({}), ConfigModule.forRoot({}), KeyModule],
    providers: [AuthService, JwtServiceLocal, JwtStrategy, RefreshStrategy, TokenCacheService, SessionService],
    controllers: [AuthController],
})
export class AuthModule {}
