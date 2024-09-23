import { User } from '../../modules/user/entities/user.entity';

export interface JwtResponse {
    user: User;
    accessToken: {
        token: string;
        exp: number;
    };
    refreshToken: {
        token: string;
        exp: number;
    };
}
