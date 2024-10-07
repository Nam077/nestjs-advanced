import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { APIResponseData, CurrentUser, UserAuth } from '@/common';
import { CreateUserDto } from '@modules/user/dto/create-user.dto';
import { UpdateUserDto } from '@modules/user/dto/update-user.dto';
import { UserCursorDto } from '@modules/user/dto/user-cursor.dto';
import { UserPaginationDto } from '@modules/user/dto/user-pagination.dto';
import { User } from '@modules/user/entities/user.entity';
import { UserService } from '@modules/user/user.service';

/**
 * User Controller
 */
@ApiTags('User')
// @ApiBearerAuth()
@Controller('user')
// @UseGuards(JwtAuthGuard)
export class UserController {
    /**
     * Constructor
     * @param {UserService} userService - The user service
     */
    constructor(private readonly userService: UserService) {}

    /**
     * Create a new user
     * @param {user} user - The user data
     * @param {CreateUserDto} createUserDto - The user data
     * @returns { Promise<APIResponseData<User>>} - The user data
     */
    @Post()
    create(@CurrentUser<UserAuth>() user: UserAuth, @Body() createUserDto: CreateUserDto): Promise<any> {
        return this.userService.create(createUserDto, user);
    }

    /**
     * Find all users
     * @param {user} user - The user data
     * @param {UserPaginationDto} userPaginationDto - The user pagination data
     * @returns { Promise<APIResponseData<User>>} - The user data
     */
    @Get('/pagination')
    findAll(
        @CurrentUser<UserAuth>() user: UserAuth,
        @Query() userPaginationDto: UserPaginationDto,
    ): Promise<APIResponseData<User>> {
        user = {
            id: '1',
            email: 'test@test.com',
            role: 'admin',
            name: 'Test User',
        };

        return this.userService.findAll(userPaginationDto, user);
    }

    /**
     * Find all users
     * @param {user} user - The user data
     * @param {UserCursorDto} userCursorDto - The user cursor data
     * @returns { Promise<APIResponseData<User>>} - The user data
     */
    @Get('/cursor')
    findAllCursor(
        @CurrentUser<UserAuth>() user: UserAuth,
        @Query() userCursorDto: UserCursorDto,
    ): Promise<APIResponseData<User>> {
        return this.userService.findCursor(userCursorDto, user);
    }

    /**
     * Find one user by ID
     * @param {user} user - The user data
     * @param {string} id - The user ID
     * @returns { Promise<APIResponseData<User>>} - The user data
     */
    @Get(':id')
    findOne(@CurrentUser<UserAuth>() user: UserAuth, @Param('id') id: string): Promise<any> {
        return this.userService.findOne(id, user);
    }

    /**
     * Update a user by ID
     * @param {user} user - The user data
     * @param {string} id - The user ID
     * @param {UpdateUserDto} updateUserDto - The user data
     * @returns { Promise<APIResponseData<User>>} - The user data
     */
    @Patch(':id')
    update(
        @CurrentUser<UserAuth>() user: UserAuth,
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto,
    ): Promise<any> {
        return this.userService.update(id, updateUserDto, user);
    }

    /**
     * Restore a user by ID
     * @param {user} user - The user data
     * @param {string} id - The user ID
     * @returns { Promise<APIResponseData<User>>} - The user data
     */
    @Patch('restore/:id')
    restore(@CurrentUser<UserAuth>() user: UserAuth, @Param('id') id: string): Promise<any> {
        return this.userService.restore(id, user);
    }

    /**
     * Remove a user by ID
     * @param {user} user - The user data
     * @param {string} id - The user ID
     * @returns { Promise<APIResponseData<User>>} - The user data
     */
    @Delete(':id')
    softRemove(@CurrentUser<UserAuth>() user: UserAuth, @Param('id') id: string): Promise<any> {
        return this.userService.softDelete(id, user);
    }

    /**
     * Remove a user by ID
     * @param {user} user - The user data
     * @param {string} id - The user ID
     * @returns { Promise<APIResponseData<User>>} - The user data
     */
    @Delete('hard/:id')
    remove(@CurrentUser<UserAuth>() user: UserAuth, @Param('id') id: string): Promise<any> {
        return this.userService.delete(id, user);
    }
}
