import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserCursorDto } from './dto/user-cursor.dto';
import { UserPaginationDto } from './dto/user-pagination.dto';
import { User } from './entities/user.entity';
import {
    APIResponseData,
    IBaseService,
    UserAuth,
    PaginationData,
    CursorData,
    FindOneOptionsCustom,
} from '../../common';

/**
 * @class UserService
 * @implements {IBaseService<User, CreateUserDto, UpdateUserDto, UserPaginationDto, UserCursorDto, UserAuth>}
 * @description Service class for managing user-related operations.
 */
@Injectable()
export class UserService
    implements IBaseService<User, CreateUserDto, UpdateUserDto, UserPaginationDto, UserCursorDto, UserAuth>
{
    /**
     * @description Creates an instance of the UserService.
     */
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    /**
     * @function isExistByEmail
     * @description Checks if a user with the specified email exists.
     * @param {string} email - The email to check.
     * @returns {Promise<boolean>} A promise that resolves with a boolean indicating if the email exists.
     */
    async isExistByEmail(email: string): Promise<boolean> {
        return await this.userRepository.exists({
            where: { email },
            withDeleted: true,
        });
    }

    /**
     * @function create
     * @description Creates a new user.
     * @param {CreateUserDto} createDto - The DTO containing user details.
     * @param {UserAuth} userAuth - The user authentication information.
     * @returns {Promise<APIResponseData<User>>} A promise that resolves with the created user data.
     */
    async create(createDto: CreateUserDto, userAuth: UserAuth): Promise<APIResponseData<User>> {
        userAuth;
        const user = await this.createHandler(createDto);

        return {
            status: HttpStatus.CREATED,
            data: user,
            message: 'User created successfully!',
        };
    }

    /**
     * @function createHandler
     * @description Handler for creating a new user.
     * @param {CreateUserDto} createDto - The DTO containing user details.
     * @returns {Promise<User>} A promise that resolves with the created user.
     */
    async createHandler(createDto: CreateUserDto): Promise<User> {
        const { email } = createDto;

        if (await this.isExistByEmail(email)) {
            throw new HttpException(`User with email ${email} already exists`, HttpStatus.CONFLICT);
        }

        const user = this.userRepository.create(createDto);

        user.hashPassword();
        const newUser = await this.userRepository.save(user);

        delete newUser.password;

        return newUser;
    }

    /**
     * @function delete
     * @description Deletes a user by ID.
     * @param {string} id - The ID of the user to delete.
     * @param {UserAuth} userAuth - The user authentication information.
     * @returns {Promise<APIResponseData<User>>} A promise that resolves with the deleted user data.
     */
    async delete(id: string, userAuth: UserAuth): Promise<APIResponseData<User>> {
        userAuth;
        const user = await this.deleteHandler(id);

        return {
            status: HttpStatus.OK,
            data: user,
            message: 'User deleted successfully!',
        };
    }

    /**
     * @function deleteHandler
     * @description Handler for deleting a user by ID.
     * @param {string} id - The ID of the user to delete.
     * @returns {Promise<User>} A promise that resolves with the deleted user.
     */
    async deleteHandler(id: string): Promise<User> {
        const user = await this.findOneOrThrow(id);

        await this.userRepository.delete(id);

        return user;
    }

    /**
     * @function findAll
     * @description Retrieves all users with pagination.
     * @param {UserPaginationDto} paginationDto - The pagination DTO.
     * @param {UserAuth} userAuth - The user authentication information.
     * @returns {Promise<APIResponseData<User>>} A promise that resolves with the list of users.
     */
    async findAll(paginationDto: UserPaginationDto, userAuth: UserAuth): Promise<APIResponseData<User>> {
        userAuth;

        return Promise.resolve(undefined);
    }

    /**
     * @function findAllHandler
     * @description Handler for retrieving all users with pagination.
     * @param {UserPaginationDto} paginationDto - The pagination DTO.
     * @param {boolean} [withDeleted] - Optional flag to include soft-deleted users.
     * @returns {Promise<PaginationData<User>>} A promise that resolves with the paginated list of users.
     */
    async findAllHandler(paginationDto: UserPaginationDto, withDeleted?: boolean): Promise<PaginationData<User>> {
        paginationDto;
        withDeleted;

        return Promise.resolve(undefined);
    }

    /**
     * @function findCursor
     * @description Retrieves users using cursor-based pagination.
     * @param {UserCursorDto} cursorDto - The cursor DTO.
     * @param {UserAuth} userAuth - The user authentication information.
     * @returns {Promise<APIResponseData<User>>} A promise that resolves with the list of users.
     */
    async findCursor(cursorDto: UserCursorDto, userAuth: UserAuth): Promise<APIResponseData<User>> {
        cursorDto;
        userAuth;

        return Promise.resolve(undefined);
    }

    /**
     * @function findCursorHandler
     * @description Handler for retrieving users using cursor-based pagination.
     * @param {UserCursorDto} cursorDto - The cursor DTO.
     * @param {boolean} [withDeleted] - Optional flag to include soft-deleted users.
     * @returns {Promise<CursorData<User>>} A promise that resolves with the cursor-based list of users.
     */
    async findCursorHandler(cursorDto: UserCursorDto, withDeleted?: boolean): Promise<CursorData<User>> {
        cursorDto;
        withDeleted;

        return Promise.resolve(undefined);
    }

    /**
     * @function findOne
     * @description Retrieves a single user by their ID.
     * @param {string} id - The ID of the user to retrieve.
     * @param {UserAuth} userAuth - The user authentication information.
     * @returns {Promise<APIResponseData<User>>} A promise that resolves with the user data.
     */
    async findOne(id: string, userAuth: UserAuth): Promise<APIResponseData<User>> {
        userAuth;
        const user = await this.findOneOrThrow(id);

        return {
            status: HttpStatus.OK,
            data: user,
            message: 'User retrieved successfully!',
        };
    }

    /**
     * @function findOneHandler
     * @description Handler for retrieving a single user by their ID.
     * @param {string} id - The ID of the user to retrieve.
     * @param {FindOneOptionsCustom<User>} [options] - Optional additional options.
     * @param {boolean} [withDeleted] - Optional flag to include soft-deleted users.
     * @returns {Promise<User>} A promise that resolves with the user.
     */
    async findOneHandler(id: string, options?: FindOneOptionsCustom<User>, withDeleted?: boolean): Promise<User> {
        return await this.userRepository.findOne({
            where: { id },
            ...options,
            withDeleted,
        });
    }

    /**
     * @function findOneOrThrow
     * @description Retrieves a single user by their ID or throws an error if not found.
     * @param {string} id - The ID of the user to retrieve.
     * @param {FindOneOptionsCustom<User>} [options] - Optional additional options.
     * @param {boolean} [withDeleted] - Optional flag to include soft-deleted users.
     * @returns {Promise<User>} A promise that resolves with the user.
     */
    async findOneOrThrow(id: string, options?: FindOneOptionsCustom<User>, withDeleted?: boolean): Promise<User> {
        const user = await this.findOneHandler(id, options, withDeleted);

        if (!user) {
            throw new HttpException(`User with ID ${id} not found`, HttpStatus.NOT_FOUND);
        }

        return user;
    }

    /**
     * @function restore
     * @description Restores a soft-deleted user by ID.
     * @param {string} id - The ID of the user to restore.
     * @param {UserAuth} userAuth - The user authentication information.
     * @returns {Promise<APIResponseData<User>>} A promise that resolves with the restored user data.
     */
    async restore(id: string, userAuth: UserAuth): Promise<APIResponseData<User>> {
        userAuth;
        const user = await this.restoreHandler(id);

        return {
            status: HttpStatus.OK,
            data: user,
            message: 'User restored successfully!',
        };
    }

    /**
     * @function restoreHandler
     * @description Handler for restoring a soft-deleted user by ID.
     * @param {string} id - The ID of the user to restore.
     * @returns {Promise<User>} A promise that resolves with the restored user.
     */
    async restoreHandler(id: string): Promise<User> {
        const user = await this.findOneOrThrow(id, undefined, true);

        if (!user.deletedAt) {
            throw new BadRequestException(`User with ID ${id} is not deleted`);
        }

        user.deletedAt = null;

        await this.userRepository.restore(id);

        return user;
    }

    /**
     * @function softDelete
     * @description Soft deletes a user by ID.
     * @param {string} id - The ID of the user to soft delete.
     * @param {UserAuth} userAuth - The user authentication information.
     * @returns {Promise<APIResponseData<User>>} A promise that resolves with the soft-deleted user data.
     */
    async softDelete(id: string, userAuth: UserAuth): Promise<APIResponseData<User>> {
        userAuth;
        const user = await this.softDeleteHandler(id);

        return {
            status: HttpStatus.OK,
            data: user,
            message: 'User soft-deleted successfully!',
        };
    }

    /**
     * @function softDeleteHandler
     * @description Handler for soft deleting a user by ID.
     * @param {string} id - The ID of the user to soft delete.
     * @returns {Promise<User>} A promise that resolves with the soft-deleted user.
     */
    async softDeleteHandler(id: string): Promise<User> {
        const user = await this.findOneOrThrow(id);

        if (user.deletedAt) {
            throw new BadRequestException(`User with ID ${id} is already deleted`);
        }

        await this.userRepository.softDelete(id);

        return user;
    }

    /**
     * @function update
     * @description Updates a user by their ID.
     * @param {string} id - The ID of the user to update.
     * @param {UpdateUserDto} updateDto - The DTO containing the updated user details.
     * @param {UserAuth} userAuth - The user authentication information.
     * @returns {Promise<APIResponseData<User>>} A promise that resolves with the updated user data.
     */
    async update(id: string, updateDto: UpdateUserDto, userAuth: UserAuth): Promise<APIResponseData<User>> {
        const userCheck: User = await this.findOneOrThrow(id);

        if (userAuth.role !== 'admin' && userCheck.id !== userAuth.id) {
            throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
        }

        if (updateDto.role && userAuth.role !== 'admin') {
            throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
        }

        const user = await this.updateHandler(id, updateDto);

        return {
            status: HttpStatus.OK,
            data: user,
            message: 'User updated successfully!',
        };
    }

    /**
     * @function updateHandler
     * @description Handler for updating a user by their ID.
     * @param {string} id - The ID of the user to update.
     * @param {UpdateUserDto} updateDto - The DTO containing the updated user details.
     * @returns {Promise<User>} A promise that resolves with the updated user.
     */
    async updateHandler(id: string, updateDto: UpdateUserDto): Promise<User> {
        const user = await this.findOneOrThrow(id);

        const { email, password, name, role } = updateDto;

        // Check if email needs to be updated and whether it already exists
        if (email && email !== user.email) {
            const emailExists = await this.isExistByEmail(email);

            if (emailExists) {
                throw new HttpException(`User with email ${email} already exists`, HttpStatus.CONFLICT);
            }

            user.email = email;
        }

        // Update password only if provided and hash it
        if (password) {
            user.password = password;
            user.hashPassword();
        }

        // Update name and role if provided
        if (name) {
            user.name = name;
        }

        if (role) {
            user.role = role;
        }

        return await this.userRepository.save(user);
    }

    /**
     * @function validatePassword
     * @description Validates a user's password.
     * @param {string} email - The email of the user.
     */
    async findByEmail(email: string) {
        return await this.userRepository.findOne({
            where: { email },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                password: true,
            },
        });
    }

    /**
     * @function validatePassword
     * @description Validates a user's password.
     * @param {string} email - The email of the user.
     * @param {string} id - The ID of the user.
     */
    async findByEmailAndId(email: string, id: string): Promise<User> {
        return await this.userRepository.findOne({
            where: { email, id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
            },
        });
    }
}
