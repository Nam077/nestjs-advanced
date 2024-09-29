import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Brackets, Repository } from 'typeorm';

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
    UserRole,
    UserStatus,
    OrderDirection,
} from '../../common';
import { RegisterDto } from '../auth/dtos/register.dto';

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

        return {
            status: HttpStatus.OK,
            message: 'Users retrieved successfully!',
            ...(await this.findAllHandler(paginationDto)),
        };
    }

    /**
     * @function findAllHandler
     * @description Handler for retrieving all users with pagination.
     * @param {UserPaginationDto} paginationDto - The pagination DTO.
     * @param {boolean} [withDeleted] - Optional flag to include soft-deleted users.
     * @returns {Promise<PaginationData<User>>} A promise that resolves with the paginated list of users.
     */
    async findAllHandler(paginationDto: UserPaginationDto, withDeleted?: boolean): Promise<PaginationData<User>> {
        const { limit, order, orderBy, page = 1, search } = paginationDto;

        const query = this.userRepository
            .createQueryBuilder('user')
            .select([
                'user.id',
                'user.email',
                'user.name',
                'user.role',
                'user.status',
                'user.createdAt',
                'user.updatedAt',
            ])
            .skip(limit * (page - 1))
            .take(limit);

        if (orderBy) {
            query.orderBy(`user.${orderBy}`, order || 'ASC');
        } else {
            query.orderBy('user.id', 'ASC');
        }

        if (search) {
            query.where('user.name LIKE :search OR user.email LIKE :search', { search: `%${search}%` });
        }

        if (withDeleted) {
            query.andWhere(
                new Brackets((qb) => {
                    qb.where('user.name LIKE :search', { search: `%${search}%` }).orWhere('user.email LIKE :search', {
                        search: `%${search}%`,
                    });
                }),
            );
        }

        const [data, total] = await query.getManyAndCount();

        return {
            items: data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                nextPage: page * limit < total ? page + 1 : undefined,
                prevPage: page > 1 ? page - 1 : undefined,
            },
        };
    }

    /**
     * @function findCursor
     * @description Retrieves users using cursor-based pagination.
     * @param {UserCursorDto} cursorDto - The cursor DTO.
     * @param {UserAuth} userAuth - The user authentication information.
     * @returns {Promise<APIResponseData<User>>} A promise that resolves with the list of users.
     */
    async findCursor(cursorDto: UserCursorDto, userAuth: UserAuth): Promise<APIResponseData<User>> {
        userAuth;

        return {
            status: HttpStatus.OK,
            message: 'Users retrieved successfully!',
            ...(await this.findCursorHandler(cursorDto)),
        };
    }

    /**
     * @function findCursorHandler
     * @description Handler for retrieving users using cursor-based pagination.
     * @param {UserCursorDto} cursorDto - The cursor DTO.
     * @param {boolean} [withDeleted] - Optional flag to include soft-deleted users.
     * @returns {Promise<CursorData<User>>} A promise that resolves with the cursor-based list of users.
     */
    async findCursorHandler(cursorDto: UserCursorDto, withDeleted?: boolean): Promise<CursorData<User>> {
        const { cursor, limit, orderDirection, search } = cursorDto;

        const query = this.userRepository
            .createQueryBuilder('user')
            .select([
                'user.id',
                'user.email',
                'user.name',
                'user.role',
                'user.status',
                'user.createdAt',
                'user.updatedAt',
            ])
            .take(limit);

        if (cursor) {
            if (orderDirection === OrderDirection.DESC) {
                query.where('user.id < :cursor', { cursor });
            } else {
                query.where('user.id > :cursor', { cursor });
            }
        }

        query.orderBy('user.id', orderDirection || 'ASC');

        if (search) {
            query.andWhere('user.name LIKE :search OR user.email LIKE :search', { search: `%${search}%` });
        }

        if (withDeleted) {
            query.withDeleted();
        }

        const data = await query.getMany();

        return {
            items: data,
            pagination: {
                hasMore: data.length === limit,
                nextCursor: data.length === limit ? data[data.length - 1].id : undefined,
                prevCursor: cursor,
            },
        };
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
                status: true,
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
            where: { email, id, status: UserStatus.ACTIVE },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
            },
        });
    }

    /**
     * @function register - Registers a new user.
     * @param {RegisterDto} registerDto - The DTO containing the user details.
     * @returns {Promise<User>} A promise that resolves with the registered user.
     */
    async register(registerDto: RegisterDto): Promise<User> {
        return await this.createHandler({
            email: registerDto.email,
            name: registerDto.name,
            password: registerDto.password,
            role: UserRole.USER,
            status: UserStatus.INACTIVE,
        });
    }

    /**
     * @function verifyEmail
     * @description Verifies a user's email.
     * @param {string} id - The ID of the user to verify.
     * @returns {Promise<User>} A promise that resolves with the verified user.
     */
    async verifyEmail(id: string): Promise<User> {
        const user = await this.findOneOrThrow(id);

        if (user.status === UserStatus.ACTIVE) {
            throw new HttpException('User already verified', HttpStatus.BAD_REQUEST);
        }

        user.status = UserStatus.ACTIVE;

        return await this.userRepository.save(user);
    }

    /**
     *
     */
    async resetPassword(id: string, password: string) {
        const user = await this.findOneOrThrow(id);

        user.password = password;
        user.hashPassword();

        return await this.userRepository.save(user);
    }
}
