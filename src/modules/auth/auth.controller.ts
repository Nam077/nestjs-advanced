import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { Request } from 'express';

import { AuthService, LoginResponse } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { JwtAuthGuard } from './guards/jwt.guard';
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
     * @param {Request} req - The request object
     */
    @UseGuards(JwtAuthGuard)
    @Get('profile')
    profile(@Req() req: Request) {
        return req.user;
    }
}
