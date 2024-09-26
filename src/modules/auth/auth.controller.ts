import { Body, Controller, Get, Param, Post, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { Details } from 'express-useragent';
import { FastifyReply } from 'fastify';

import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { JwtAuthGuard } from './guards/jwt.guard';
import { convertTimeStampToDate, CurrentUser, GeoIp, GeoIpI, UserAgentCustom, UserAuth } from '../../common';
import { RefreshGuard } from './guards/refresh.guard';
import { EmailAuthProducerService } from '../message-queue-module/producers/email-auth-producer.service';

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
     * @param {EmailAuthProducerService} emailAuthProducerService - The email auth producer service instance
     */
    constructor(
        private readonly authService: AuthService,
        private readonly emailAuthProducerService: EmailAuthProducerService,
    ) {}

    /**
     * @param {LoginDto} loginDto - The login data
     * @param {Details} ua - The user agent data
     * @param {GeoIpI} ipGeo - The geo IP data
     * @param {FastifyReply} response - The Fastify response object
     * @returns {Promise<any>} The login response
     */
    @Post('login')
    async login(
        @Body() loginDto: LoginDto,
        @UserAgentCustom() ua: Details,
        @GeoIp() ipGeo: GeoIpI,
        @Res({ passthrough: true }) response: FastifyReply,
    ): Promise<any> {
        const data = await this.authService.login(loginDto, ua, ipGeo);

        response.setCookie('refreshToken', data.data.refreshToken.token, {
            expires: convertTimeStampToDate(data.data.refreshToken.exp),
            httpOnly: true,
            path: '/',
            sameSite: 'strict',
        });

        delete data.data.refreshToken;

        return data;
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

    /**
     * @param {string} email - The email address
     * @returns {Promise<any>} The response
     */
    @Get('profile/:email')
    async test(@Param('email') email: string): Promise<any> {
        await this.emailAuthProducerService.sendConfirmationEmail(email, 'token');

        return {
            message: 'Email sent',
        };
    }

    /**
     *
     * @param {UserAuth} currentUser - The current user
     * @param {FastifyReply} response - The Fastify response object
     * @returns {any} The refresh token
     */
    @UseGuards(RefreshGuard)
    @Post('refresh')
    async refresh(
        @CurrentUser<UserAuth>() currentUser: UserAuth,
        @Res({ passthrough: true }) response: FastifyReply,
    ): Promise<any> {
        const data = await this.authService.refresh(currentUser);

        response.setCookie('refreshToken', data.refreshToken.token, {
            expires: convertTimeStampToDate(data.refreshToken.exp),
            httpOnly: true,
            path: '/',
            sameSite: 'strict',
        });

        delete data.refreshToken;

        return data;
    }
}
