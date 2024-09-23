export interface JwtPayload {
    name: string;
    email: string;
    sub: string;
    iat?: number;
    exp?: number;
}
