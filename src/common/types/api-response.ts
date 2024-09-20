import {
    SingleDataAPIResponse,
    MultipleDataAPIResponse,
    PaginationAPIResponse,
    CursorAPIResponse,
} from '../interfaces/api-response.interface';

export type APIResponseData<ENTITY> =
    | SingleDataAPIResponse<ENTITY>
    | MultipleDataAPIResponse<ENTITY>
    | PaginationAPIResponse<ENTITY>
    | CursorAPIResponse<ENTITY>;
