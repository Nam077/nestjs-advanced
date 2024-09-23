declare namespace NodeJS {
    export interface ProcessEnv {
        POSTGRES_HOST: string;
        POSTGRES_PORT: string;
        POSTGRES_USER: string;
        POSTGRES_PASSWORD: string;
        POSTGRES_DB: string;
        REDIS_HOST: string;
        REDIS_PORT: string;
        APP_PORT: string;
        APP_SECRET: string;
    }
}
