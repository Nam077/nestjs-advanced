import {
    CursorAPIResponse,
    MultipleDataAPIResponse,
    PaginationAPIResponse,
    SingleDataAPIResponse,
} from '../interfaces/api-response.interface';

export type APIResponseData<ENTITY> =
    | SingleDataAPIResponse<ENTITY>
    | MultipleDataAPIResponse<ENTITY>
    | PaginationAPIResponse<ENTITY>
    | CursorAPIResponse<ENTITY>;
