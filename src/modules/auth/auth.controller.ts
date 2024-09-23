import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { AuthService, LoginResponse } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { JwtAuthGuard } from './guards/jwt.guard';
import { UserAuth } from '../../common';
import { CurrentUser } from '../../common/decorators';
/**
 *
 */
@ApiTags('Auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
    /**
     *
     * @param {AuthService} authService - The auth service instance
     */
    constructor(private readonly authService: AuthService) {}

    /**
     * @param {LoginDto} loginDto - The login data
     * @returns {Promise<LoginResponse>} The login response
     */
    @Post('login')
    login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
        return this.authService.login(loginDto);
    }

    /**
     * @param {UserAuth} user - The user data from the JWT token
     * @returns {UserAuth} The user data
     */
    @UseGuards(JwtAuthGuard)
    @Get('profile')
    profile(@CurrentUser<UserAuth>() user: UserAuth): UserAuth {
        return user;
    }
}
