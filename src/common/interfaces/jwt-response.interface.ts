import { User } from '../../modules/user/entities/user.entity';

export interface AccessToken {
    token: string;
    jwtId: string;
    exp: number;
}

export interface RefreshToken {
    token: string;
    jwtId: string;
    exp: number;
    sessionId: string;
}
export interface JwtResponse {
    user: User;
    accessToken: AccessToken;
    refreshToken: RefreshToken;
}
