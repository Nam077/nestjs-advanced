interface BaseAPIResponse {
    message: string;
    status: number;
}
export interface SingleDataAPIResponse<ENTITY> extends BaseAPIResponse {
    data: ENTITY;
}

export interface MultipleDataAPIResponse<ENTITY> extends BaseAPIResponse {
    data: ENTITY[];
}

export interface PaginationData<ENTITY> {
    items: ENTITY[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        prevPage?: number;
        nextPage?: number;
    };
}
export interface CursorData<ENTITY> {
    items: ENTITY[];
    pagination: {
        nextCursor?: string;
        prevCursor?: string;
        hasMore: boolean;
    };
}

export interface PaginationAPIResponse<ENTITY> extends BaseAPIResponse, PaginationData<ENTITY> {}

export interface CursorAPIResponse<ENTITY> extends BaseAPIResponse, CursorData<ENTITY> {}
