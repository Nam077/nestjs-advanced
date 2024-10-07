import { AccessToken, RefreshToken } from '@/common';
import { User } from '@modules/user/entities/user.entity';

export interface LoginResponse {
    data: {
        accessToken: Omit<AccessToken, 'jwtId'>;
        refreshToken: Omit<RefreshToken, 'jwtId' | 'sessionId'>;
        user?: User;
    };
    message: string;
}

export type TypeSendEmail = 'confirm' | 'reset';
export type TypeList = 'blacklist' | 'whitelist';

export interface RegisterResponse {
    message: string;
    user: User;
}

export interface MessageResponse {
    message: string;
}
