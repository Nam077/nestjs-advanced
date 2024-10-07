import { CursorData, FindOneOptionsCustom, PaginationData } from '@/common';

import { APIResponseData } from '../types';

/* eslint-disable @typescript-eslint/method-signature-style */

export interface IBaseService<Entity, CreateDto, UpdateDto, PaginationDto, CursorDto, UserAuth> {
    findAllHandler(paginationDto: PaginationDto, withDeleted?: boolean): Promise<PaginationData<Entity>>;
    findAll(paginationDto: PaginationDto, userAuth: UserAuth): Promise<APIResponseData<Entity>>;
    findCursorHandler(cursorDto: CursorDto, withDeleted?: boolean): Promise<CursorData<Entity>>;
    findCursor(cursorDto: CursorDto, userAuth: UserAuth): Promise<APIResponseData<Entity>>;
    findOneHandler(id: string, options?: FindOneOptionsCustom<Entity>, withDeleted?: boolean): Promise<Entity>;
    findOneOrThrow(id: string, options?: FindOneOptionsCustom<Entity>, withDeleted?: boolean): Promise<Entity>;
    findOne(id: string, userAuth: UserAuth): Promise<APIResponseData<Entity>>;
    createHandler(createDto: CreateDto): Promise<Entity>;
    create(createDto: CreateDto, userAuth: UserAuth): Promise<APIResponseData<Entity>>;
    updateHandler(id: string, updateDto: UpdateDto): Promise<Entity>;
    update(id: string, updateDto: UpdateDto, userAuth: UserAuth): Promise<APIResponseData<Entity>>;
    softDeleteHandler(id: string): Promise<Entity>;
    softDelete(id: string, userAuth: UserAuth): Promise<APIResponseData<Entity>>;
    deleteHandler(id: string): Promise<Entity>;
    delete(id: string, userAuth: UserAuth): Promise<APIResponseData<Entity>>;
    restoreHandler(id: string): Promise<Entity>;
    restore(id: string, userAuth: UserAuth): Promise<APIResponseData<Entity>>;
}
