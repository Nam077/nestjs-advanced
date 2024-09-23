import { User } from '../../modules/user/entities/user.entity';

export interface AccessToken {
    token: string;
    jwtId: string;
    exp: string;
}

export interface RefreshToken {
    token: string;
    jwtId: string;
    exp: string;
}
export interface JwtResponse {
    user: User;
    accessToken: AccessToken;
    refreshToken: RefreshToken;
}
