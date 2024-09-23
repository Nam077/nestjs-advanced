import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { Details } from 'express-useragent';

import { AuthService, LoginResponse } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { JwtAuthGuard } from './guards/jwt.guard';
import { UserAuth } from '../../common';
import { CurrentUser, GeoIp, GeoIpI, UserAgentCustom } from '../../common/decorators';
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
     * @param {Details} ua - The user agent data
     * @param {GeoIpI} ipGeo - The geo IP data
     * @returns {Promise<LoginResponse>} The login response
     */
    @Post('login')
    login(@Body() loginDto: LoginDto, @UserAgentCustom() ua: Details, @GeoIp() ipGeo: GeoIpI): Promise<LoginResponse> {
        console.log(ua);
        console.log(ipGeo);

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
