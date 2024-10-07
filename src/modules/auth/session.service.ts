import { Injectable } from '@nestjs/common';

import { BLACKLIST_KEY, SESSION_KEY, WHITELIST_KEY } from '@common/constants';
import { convertTimeStampToSeconds } from '@common/helpers';
import { JwtPayload } from '@common/interfaces';
import { RedisService } from '@modules/cache/cache.service';

export interface SessionData {
    ip: string;
    userAgent: string;
    userId: string;
    email: string;
    os: string;
    browser: string;
    jwtRefreshId?: string;
    expRef?: number;
    jwtAccessId?: string;
    expAcc?: number;
    sessionId?: string;
}
export enum SecurityKeyType {
    BLACKLIST_KEY = 'blacklist',
    WHITELIST_KEY = 'whitelist',
}

export type TokenValidationType = 'access' | 'refresh';

interface JWTTokenCache {
    jti: string;
    exp: number;
}
/**
 *
 */
@Injectable()
export class SessionService {
    /**
     *
     * @param {RedisService} cacheService - The cache service
     */
    constructor(private readonly cacheService: RedisService) {}

    /**
     *
     * @param {string} userId - The user ID
     * @returns {string} The key for the user's sessions
     */
    getUserSessionsKey(userId: string): string {
        return `${SESSION_KEY}:user:${userId}`;
    }

    /**
     *
     * @param {string} sessionId - The session ID
     * @returns {string} The key for the session
     */
    getSessionKey(sessionId: string): string {
        return `${SESSION_KEY}:${sessionId}`;
    }

    /**
     *
     * @param {SecurityKeyType} keyType - The type of key
     * @param {string} jti - The JWT ID (jti) from the token payload.
     * @returns {string} The key for the token
     */
    getKeyTokenKey(keyType: SecurityKeyType, jti: string): string {
        return `${keyType}:${jti}`;
    }

    /**
     *
     * @param {string} jti - The JWT ID (jti) from the token payload.
     * @param {number} ttl - The time-to-live for the token
     * @returns {Promise<boolean>} Whether the token is blacklisted
     */
    async addToBlacklist(jti: string, ttl: number): Promise<void> {
        return await this.cacheService.set(`${BLACKLIST_KEY}:${jti}`, true, ttl);
    }

    /**
     *
     * @param {string} jti - The JWT ID (jti) from the token payload.
     * @param {number} ttl - The time-to-live for the token
     * @returns {Promise<boolean>} Whether the token is blacklisted
     */
    async addToWhitelist(jti: string, ttl: number): Promise<void> {
        return await this.cacheService.set(`${WHITELIST_KEY}:${jti}`, true, ttl);
    }

    /**
     *
     * @param {string} jti - The JWT ID (jti) from the token payload.
     * @returns {Promise<boolean>} Whether the token is blacklisted
     */
    async removeFromBlacklist(jti: string): Promise<void> {
        return await this.cacheService.del(`${BLACKLIST_KEY}:${jti}`);
    }

    /**
     * @param {JWTTokenCache} refreshToken - The refresh token to store
     * @param {JWTTokenCache} accessToken - The access token to store
     * @returns {Promise<void>} Resolves when the tokens are stored
     */
    async addToBlacklistToken(refreshToken: JWTTokenCache, accessToken: JWTTokenCache): Promise<void> {
        await Promise.all([
            this.cacheService.set(
                `${BLACKLIST_KEY}:${refreshToken.jti}`,
                true,
                convertTimeStampToSeconds(refreshToken.exp),
            ),
            this.cacheService.set(
                `${BLACKLIST_KEY}:${accessToken.jti}`,
                true,
                convertTimeStampToSeconds(accessToken.exp),
            ),
        ]);
    }

    // add to whitelist

    /**
     *
     * @param {JWTTokenCache} refreshToken - The refresh token to store
     * @param {JWTTokenCache} accessToken - The access token to store
     * @returns {Promise<void>} Resolves when the tokens are stored
     */
    async addToWhitelistToken(refreshToken: JWTTokenCache, accessToken: JWTTokenCache): Promise<void> {
        await Promise.all([
            this.cacheService.set(
                `${WHITELIST_KEY}:${refreshToken.jti}`,
                true,
                convertTimeStampToSeconds(refreshToken.exp),
            ),
            this.cacheService.set(
                `${WHITELIST_KEY}:${accessToken.jti}`,
                true,
                convertTimeStampToSeconds(accessToken.exp),
            ),
        ]);
    }

    /**
     *
     * @param {JWTTokenCache} jtiRefresh - The refresh token to remove
     * @param {JWTTokenCache} jtiAccess - The access token to remove
     */
    async removeWhitelistToken(jtiRefresh: string, jtiAccess: string): Promise<void> {
        await Promise.all([
            this.cacheService.del(`${WHITELIST_KEY}:${jtiRefresh}`),
            this.cacheService.del(`${WHITELIST_KEY}:${jtiAccess}`),
        ]);
    }

    /**
     *
     * @param {SessionData} userData - The user data to store
     * @param {string} sessionId - The session ID
     * @param {number} exp - The time-to-live for the session
     * @returns {Promise<void>} Resolves when the session is stored
     */
    async storeSession(userData: SessionData, sessionId: string, exp: number): Promise<void> {
        const sessionKey = this.getSessionKey(sessionId);
        const userSessionsKey = this.getUserSessionsKey(userData.userId);

        await Promise.all([
            this.cacheService.set(sessionKey, userData, convertTimeStampToSeconds(exp)),
            await this.cacheService.sadd(userSessionsKey, sessionId),
        ]);
    }

    /**
     *
     * @param {SessionData} userData - The user data to store
     */
    async updateSession(userData: SessionData): Promise<void> {
        const sessionKey = this.getSessionKey(userData.sessionId);

        await this.cacheService.set(sessionKey, userData, convertTimeStampToSeconds(userData.expRef));
    }

    // save session and add to whitelist
    /**
     *
     * @param {SessionData} userData - The user data to store
     */
    async createNewSession(userData: SessionData): Promise<void> {
        const sessionId = userData.sessionId;

        await this.storeSession(userData, sessionId, userData.expRef);
    }

    /**
     *
     * @param {string} sessionId - The session ID
     * @returns {Promise<SessionData>} The user data
     */
    async getSessionById(sessionId: string): Promise<SessionData> {
        const sessionKey = this.getSessionKey(sessionId);

        return this.cacheService.get<SessionData>(sessionKey);
    }

    /**
     *
     * @param {string} userId - The user ID
     * @returns {Promise<SessionData[]>} The user data
     */
    async getAllSessions(userId: string): Promise<SessionData[]> {
        const userSessionsKey = this.getUserSessionsKey(userId);
        const sessionIds = await this.cacheService.smembers(userSessionsKey);
        const pipeline = this.cacheService.pipeline();

        sessionIds.forEach((sessionId) => {
            pipeline.get(this.getSessionKey(sessionId));
        });

        const sessionData = await pipeline.exec();

        return sessionData
            .filter(([err, result]) => !err && result)
            .map(([, result]) => JSON.parse(result) as SessionData);
    }

    /**
     *
     * @param {string} sessionId - The session ID
     */
    async removeSession(sessionId: string): Promise<void> {
        const sessionKey = this.getSessionKey(sessionId);
        const userSessionsKey = this.getUserSessionsKey(sessionId);
        const userData = await this.cacheService.get<SessionData>(sessionKey);

        console.log(userData);

        await Promise.all([
            this.cacheService.del(sessionKey),
            this.cacheService.srem(userSessionsKey, sessionId),
        ]).catch((err) => {
            console.log(err);
        });
    }

    /**
     *
     * @param {string} userId - The user ID
     * @param {string[]} sessionIds - The session IDs
     */
    async removeAllSessions(userId: string, sessionIds?: string[]): Promise<void> {
        const userSessionsKey = this.getUserSessionsKey(userId);

        sessionIds = sessionIds || (await this.cacheService.smembers(userSessionsKey));
        if (!sessionIds.length) return;

        const pipeline = this.cacheService.pipeline();

        for (const sessionId of sessionIds) {
            const sessionKey = this.getSessionKey(sessionId);

            await Promise.all([this.cacheService.del(sessionKey), this.cacheService.srem(userSessionsKey, sessionId)]);

            await pipeline.exec();
        }

        await pipeline.exec();

        const sessionIdsAfter = await this.cacheService.smembers(userSessionsKey);

        if (!sessionIdsAfter.length) {
            await this.cacheService.del(userSessionsKey);
        }
    }

    /**
     *
     * @param {JwtPayload} jwtPayload - The payload to check
     * @param {TokenValidationType} tokenValidationType - The token type to check
     * @returns {Promise<boolean>} Whether the session is valid
     */
    async validateSession(jwtPayload: JwtPayload, tokenValidationType: TokenValidationType): Promise<boolean> {
        const dataSession = await this.getSessionById(jwtPayload.sessionId);

        if (!dataSession) {
            return false;
        }

        if (tokenValidationType === 'access') {
            if (dataSession.jwtAccessId !== jwtPayload.jti) {
                return false;
            }
        } else {
            if (dataSession.jwtRefreshId !== jwtPayload.jti) {
                return false;
            }
        }

        return true;
    }
}
