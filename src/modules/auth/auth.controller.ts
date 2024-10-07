import { Body, Controller, Delete, Get, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { Details } from 'express-useragent';
import { FastifyReply, FastifyRequest } from 'fastify';

import { convertTimeStampToDate, CurrentUser, GeoIp, GeoIpI, UserAgentCustom, UserAuth } from '@/common';
import { JwtAuthGuard } from '@guards/jwt.guard';
import { RefreshGuard } from '@guards/refresh.guard';
import { AuthService } from '@modules/auth/auth.service';
import { LoginDto } from '@modules/auth/dtos/login.dto';
import { LogoutSessionsDto } from '@modules/auth/dtos/logout-sessions.dto';
import { RegisterDto } from '@modules/auth/dtos/register.dto';
import { ResendEmailDto } from '@modules/auth/dtos/resend-email.dto';
import { ResetPasswordDto } from '@modules/auth/dtos/reset-password.dto';
import { SendRestPasswordDto } from '@modules/auth/dtos/send-reset-password.dto';
import { TokenDto } from '@modules/auth/dtos/token.dto';

/**
 *
 */
@ApiTags('Auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
    /**
     * @param {AuthService} authService - The auth service instance
     */
    constructor(private readonly authService: AuthService) {}

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
     * @param {RegisterDto} registerDto - The register data
     * @returns {Promise<any>} The login response
     */
    @Post('register')
    @Throttle({
        short: {},
    })
    async register(@Body() registerDto: RegisterDto): Promise<any> {
        return await this.authService.register(registerDto);
    }

    /**
     *
     * @param {TokenDto} tokenDto - The token data
     * @param {Details} ua - The user agent data
     * @param {GeoIpI} ipGeo - The geo IP data
     * @param {FastifyReply} response - The Fastify response object
     * @returns {Promise<any>} The login response
     */
    @Get('verify-email')
    async verifyEmail(
        @Query() tokenDto: TokenDto,
        @UserAgentCustom() ua: Details,
        @GeoIp() ipGeo: GeoIpI,
        @Res({ passthrough: true }) response: FastifyReply,
    ): Promise<any> {
        const data = await this.authService.verifyEmail(tokenDto.token, ua, ipGeo);

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
     * @param {ResendEmailDto} resendEmailDto - The resend email data
     * @returns {Promise<any>} The resend email response
     * @description Resend the verification email
     */
    @Post('resend-verification-email')
    async resendVerificationEmail(@Body() resendEmailDto: ResendEmailDto): Promise<any> {
        return await this.authService.resendVerificationEmail(resendEmailDto);
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

    /**
     *
     * @param {UserAuth} currentUser - The current user
     * @param {FastifyRequest} request - The Fastify request object
     * @param {FastifyReply} response - The Fastify response object
     * @returns {Promise<void>} The logout response
     */
    @Get('logout')
    @UseGuards(JwtAuthGuard)
    async logout(
        @CurrentUser<UserAuth>() currentUser: UserAuth,
        @Req() request: FastifyRequest,
        @Res({ passthrough: true }) response: FastifyReply,
    ): Promise<void> {
        const refreshToken = request.cookies['refreshToken'];
        const data = await this.authService.logout(currentUser, refreshToken);

        return response.clearCookie('refreshToken').send({
            message: data.message,
        });
    }

    /**
     *
     * @param {UserAuth} currentUser - The current user
     * @param {FastifyReply} response - The Fastify response object
     * @returns {Promise<void>} The logout all response
     */
    @Get('logout-all')
    @UseGuards(JwtAuthGuard)
    async logoutAll(
        @CurrentUser<UserAuth>() currentUser: UserAuth,
        @Res({ passthrough: true }) response: FastifyReply,
    ): Promise<void> {
        const data = await this.authService.logoutAll(currentUser);

        return response.clearCookie('refreshToken').send({
            message: data.message,
        });
    }

    /**
     * @description Get all user sessions
     * @param {UserAuth} currentUser - The current user
     * @returns {Promise<any>} The user sessions
     */
    @Get('sessions')
    @UseGuards(JwtAuthGuard)
    async getUserSessions(@CurrentUser<UserAuth>() currentUser: UserAuth): Promise<any> {
        return this.authService.getUserSessions(currentUser.id);
    }

    /**
     *
     * @param {UserAuth} currentUser - The current user
     * @param {LogoutSessionsDto} logoutSessionDto - The logout session data
     * @returns {Promise<any>} The logout response
     */
    @Delete('sessions')
    @UseGuards(JwtAuthGuard)
    async logoutSessions(
        @CurrentUser<UserAuth>() currentUser: UserAuth,
        @Body() logoutSessionDto: LogoutSessionsDto,
    ): Promise<any> {
        return this.authService.logoutSessions(currentUser.id, logoutSessionDto.sessionIds);
    }

    /**
     *
     * @param {SendRestPasswordDto} sendResetPasswordDto - The send reset password data
     * @returns {Promise<any>} The send reset password response
     */
    @Post('send-reset-password')
    async sendResetPassword(@Body() sendResetPasswordDto: SendRestPasswordDto): Promise<any> {
        return this.authService.sendResetPassword(sendResetPasswordDto);
    }

    /**
     *
     * @param {TokenDto} tokenDto - The token data
     * @param {ResetPasswordDto} resetPasswordDto - The reset password data
     * @param {Details} ua - The user agent data
     * @param {GeoIpI} ipGeo - The geo IP data
     * @param {FastifyReply} response - The Fastify response object
     * @returns {Promise<any>} The reset password response
     */
    @Get('reset-password')
    async resetPassword(
        @Query() tokenDto: TokenDto,
        @Body() resetPasswordDto: ResetPasswordDto,
        @UserAgentCustom() ua: Details,
        @GeoIp() ipGeo: GeoIpI,
        @Res({ passthrough: true }) response: FastifyReply,
    ): Promise<any> {
        const data = await this.authService.resetPassword(tokenDto.token, resetPasswordDto, ua, ipGeo);

        response.setCookie('refreshToken', data.data.refreshToken.token, {
            expires: convertTimeStampToDate(data.data.refreshToken.exp),
            httpOnly: true,
            path: '/',
            sameSite: 'strict',
        });

        delete data.data.refreshToken;

        return data;
    }
}
