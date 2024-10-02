import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '@modules/user/entities/user.entity';
import { UserController } from '@modules/user/user.controller';
import { UserService } from '@modules/user/user.service';

/**
 *
 */
@Module({
    imports: [TypeOrmModule.forFeature([User])],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService],
})
export class UserModule {}
