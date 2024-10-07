export interface AccessToken {
    token: string;
    jwtId: string;
    exp: number;
    sessionId?: string;
}

export interface RefreshToken {
    token: string;
    jwtId: string;
    exp: number;
    sessionId: string;
}
export interface JwtResponse {
    accessToken: AccessToken;
    refreshToken: RefreshToken;
}
