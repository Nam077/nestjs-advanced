import { APIResponseData } from '../types';
import { CursorData, PaginationData } from './api-response.interface';
import { FindOneOptionsCustom } from './find-one-option-custom.interface';

/* eslint-disable @typescript-eslint/method-signature-style */
/**
 * Interface representing a base service with common CRUD operations and their handlers.
 * @template Entity - The type of the entity.
 * @template CreateDto - The type of the DTO for creating an entity.
 * @template UpdateDto - The type of the DTO for updating an entity.
 * @template PaginationDto - The type of the DTO for pagination.
 * @template CursorDto - The type of the DTO for cursor-based pagination.
 * @template UserAuth - The type representing user authentication information.
 */
export interface IBaseService<Entity, CreateDto, UpdateDto, PaginationDto, CursorDto, UserAuth> {
    // CRUD Operations
    /**
     * Retrieves all entities with pagination.
     * @param {PaginationDto} paginationDto - The pagination DTO.
     * @param {UserAuth} userAuth - The user authentication information.
     * @returns {Promise<APIResponseData<Entity>>} A promise that resolves to the API response data containing the entities.
     */
    findAll(paginationDto: PaginationDto, userAuth: UserAuth): Promise<APIResponseData<Entity>>;

    /**
     * Retrieves entities using cursor-based pagination.
     * @param {CursorDto} cursorDto - The cursor DTO.
     * @param {UserAuth} userAuth - The user authentication information.
     * @returns {Promise<APIResponseData<Entity>>} A promise that resolves to the API response data containing the entities.
     */
    findCursor(cursorDto: CursorDto, userAuth: UserAuth): Promise<APIResponseData<Entity>>;

    /**
     * Retrieves a single entity by its ID.
     * @param {string} id - The ID of the entity.
     * @param {UserAuth} userAuth - The user authentication information.
     * @returns {Promise<APIResponseData<Entity>>} A promise that resolves to the API response data containing the entity.
     */
    findOne(id: string, userAuth: UserAuth): Promise<APIResponseData<Entity>>;

    /**
     * Creates a new entity.
     * @param {CreateDto} createDto - The DTO for creating the entity.
     * @param {UserAuth} userAuth - The user authentication information.
     * @returns {Promise<APIResponseData<Entity>>} A promise that resolves to the API response data containing the created entity.
     */
    create(createDto: CreateDto, userAuth: UserAuth): Promise<APIResponseData<Entity>>;

    /**
     * Updates an existing entity by its ID.
     * @param {string} id - The ID of the entity.
     * @param {UpdateDto} updateDto - The DTO for updating the entity.
     * @param {UserAuth} userAuth - The user authentication information.
     * @returns {Promise<APIResponseData<Entity>>} A promise that resolves to the API response data containing the updated entity.
     */
    update(id: string, updateDto: UpdateDto, userAuth: UserAuth): Promise<APIResponseData<Entity>>;

    /**
     * Deletes an entity by its ID.
     * @param {string} id - The ID of the entity.
     * @param {UserAuth} userAuth - The user authentication information.
     * @returns {Promise<APIResponseData<Entity>>} A promise that resolves to the API response data containing the deleted entity.
     */
    delete(id: string, userAuth: UserAuth): Promise<APIResponseData<Entity>>;

    /**
     * Soft deletes an entity by its ID.
     * @param {string} id - The ID of the entity.
     * @param {UserAuth} userAuth - The user authentication information.
     * @returns {Promise<APIResponseData<Entity>>} A promise that resolves to the API response data containing the soft-deleted entity.
     */
    softDelete(id: string, userAuth: UserAuth): Promise<APIResponseData<Entity>>;

    /**
     * Restores a soft-deleted entity by its ID.
     * @param {string} id - The ID of the entity.
     * @param {UserAuth} userAuth - The user authentication information.
     * @returns {Promise<APIResponseData<Entity>>} A promise that resolves to the API response data containing the restored entity.
     */
    restore(id: string, userAuth: UserAuth): Promise<APIResponseData<Entity>>;

    // Handlers
    /**
     * Handler for retrieving all entities with pagination.
     * @param {PaginationDto} paginationDto - The pagination DTO.
     * @param {boolean} [withDeleted] - Optional flag to include soft-deleted entities.
     * @returns {Promise<PaginationData<Entity>>} A promise that resolves to the pagination data containing the entities.
     */
    findAllHandler(paginationDto: PaginationDto, withDeleted?: boolean): Promise<PaginationData<Entity>>;

    /**
     * Handler for retrieving entities using cursor-based pagination.
     * @param {CursorDto} cursorDto - The cursor DTO.
     * @param {boolean} [withDeleted] - Optional flag to include soft-deleted entities.
     * @returns {Promise<CursorData<Entity>>} A promise that resolves to the cursor data containing the entities.
     */
    findCursorHandler(cursorDto: CursorDto, withDeleted?: boolean): Promise<CursorData<Entity>>;

    /**
     * Handler for retrieving a single entity by its ID.
     * @param {string} id - The ID of the entity.
     * @param {FindOneOptionsCustom<Entity>} [options] - Optional find options.
     * @param {boolean} [withDeleted] - Optional flag to include soft-deleted entities.
     * @returns {Promise<Entity>} A promise that resolves to the entity.
     */
    findOneHandler(id: string, options?: FindOneOptionsCustom<Entity>, withDeleted?: boolean): Promise<Entity>;

    /**
     * Handler for creating a new entity.
     * @param {CreateDto} createDto - The DTO for creating the entity.
     * @returns {Promise<Entity>} A promise that resolves to the created entity.
     */
    createHandler(createDto: CreateDto): Promise<Entity>;

    /**
     * Handler for updating an existing entity by its ID.
     * @param {string} id - The ID of the entity.
     * @param {UpdateDto} updateDto - The DTO for updating the entity.
     * @returns {Promise<Entity>} A promise that resolves to the updated entity.
     */
    updateHandler(id: string, updateDto: UpdateDto): Promise<Entity>;

    /**
     * Handler for deleting an entity by its ID.
     * @param {string} id - The ID of the entity.
     * @returns {Promise<Entity>} A promise that resolves to the deleted entity.
     */
    deleteHandler(id: string): Promise<Entity>;

    /**
     * Handler for soft deleting an entity by its ID.
     * @param {string} id - The ID of the entity.
     * @returns {Promise<Entity>} A promise that resolves to the soft-deleted entity.
     */
    softDeleteHandler(id: string): Promise<Entity>;

    /**
     * Handler for restoring a soft-deleted entity by its ID.
     * @param {string} id - The ID of the entity.
     * @returns {Promise<Entity>} A promise that resolves to the restored entity.
     */
    restoreHandler(id: string): Promise<Entity>;
}
