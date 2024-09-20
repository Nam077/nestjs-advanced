import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserCursorDto } from './dto/user-cursor.dto';
import { UserService } from './user.service';
import { APIResponseData, UserAuth } from '../../common';
import { UserPaginationDto } from './dto/user-pagination.dto';
import { User } from './entities/user.entity';

/**
 * User Controller
 */
@ApiTags('User')
@ApiBearerAuth()
@Controller('user')
export class UserController {
    private readonly userAuth: UserAuth = {
        id: '1',
        email: 'test@test.com',
        role: 'admin',
    };

    private readonly userPaginationDto: UserPaginationDto = {};
    private readonly userCursorDto: UserCursorDto = {};

    /**
     * Constructor
     * @param {UserService} userService - The user service
     */
    constructor(private readonly userService: UserService) {}

    /**
     * Create a new user
     * @param {CreateUserDto} createUserDto - The user data
     * @returns { Promise<APIResponseData<User>>} - The user data
     */
    @Post()
    create(@Body() createUserDto: CreateUserDto): Promise<any> {
        return this.userService.create(createUserDto, this.userAuth);
    }

    /**
     * Find all users
     * @param {UserPaginationDto} userPaginationDto - The user pagination data
     * @returns { Promise<APIResponseData<User>>} - The user data
     */
    @Get('/pagination')
    findAll(@Query() userPaginationDto: UserPaginationDto): Promise<APIResponseData<User>> {
        return this.userService.findAll(userPaginationDto, this.userAuth);
    }

    /**
     * Find all users
     * @param {UserCursorDto} userCursorDto - The user cursor data
     * @returns { Promise<APIResponseData<User>>} - The user data
     */
    @Get('/cursor')
    findAllCursor(@Query() userCursorDto: UserCursorDto): Promise<APIResponseData<User>> {
        return this.userService.findAll(userCursorDto, this.userAuth);
    }

    /**
     * Find one user by ID
     * @param {string} id - The user ID
     * @returns { Promise<APIResponseData<User>>} - The user data
     */
    @Get(':id')
    findOne(@Param('id') id: string): Promise<any> {
        return this.userService.findOne(id, this.userAuth);
    }

    /**
     * Update a user by ID
     * @param {string} id - The user ID
     * @param {UpdateUserDto} updateUserDto - The user data
     * @returns { Promise<APIResponseData<User>>} - The user data
     */
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<any> {
        return this.userService.update(id, updateUserDto, this.userAuth);
    }

    /**
     * Restore a user by ID
     * @param {string} id - The user ID
     * @returns { Promise<APIResponseData<User>>} - The user data
     */
    @Patch('restore/:id')
    restore(@Param('id') id: string): Promise<any> {
        return this.userService.restore(id, this.userAuth);
    }

    /**
     * Remove a user by ID
     * @param {string} id - The user ID
     * @returns { Promise<APIResponseData<User>>} - The user data
     */
    @Delete(':id')
    softRemove(@Param('id') id: string): Promise<any> {
        return this.userService.softDelete(id, this.userAuth);
    }

    /**
     * Remove a user by ID
     * @param {string} id - The user ID
     * @returns { Promise<APIResponseData<User>>} - The user data
     */
    @Delete('hard/:id')
    remove(@Param('id') id: string): Promise<any> {
        return this.userService.delete(id, this.userAuth);
    }
}
