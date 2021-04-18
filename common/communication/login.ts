export interface login {
    username: string;
    password: string;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
}

export const ACCESS_TOKEN_LIFETIME = 300;                                       // seconds (5 minutes)
export const ACCESS_TOKEN_REFRESH_INTERVAL = 1000 * ACCESS_TOKEN_LIFETIME / 2;  // milliseconds
export const REFRESH_TOKEN_LIFETIME = 86400;                                    // seconds (1 day)
