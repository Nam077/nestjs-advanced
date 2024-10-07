import { Injectable } from '@nestjs/common';

import { BLACKLIST_KEY, SESSION_KEY, WHITELIST_KEY } from '@common/constants';
import { convertTimeStampToSeconds } from '@common/helpers';
import { AccessToken, RefreshToken } from '@common/interfaces';
import { RedisService } from '@modules/cache/cache.service';

export interface UserData {
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
     * @param {UserData} userData - The user data to store
     * @param {string} sessionId - The session ID
     * @param {number} exp - The time-to-live for the session
     * @returns {Promise<void>} Resolves when the session is stored
     */
    async storeSession(userData: UserData, sessionId: string, exp: number): Promise<void> {
        const sessionKey = this.getSessionKey(sessionId);
        const userSessionsKey = this.getUserSessionsKey(userData.userId);

        await Promise.all([
            this.cacheService.set(sessionKey, userData, convertTimeStampToSeconds(exp)),
            await this.cacheService.sadd(userSessionsKey, sessionId),
        ]);
    }

    /**
     *
     * @param {UserData} userData - The user data to store
     * @param {string} sessionId - The session ID
     * @param {number} exp - The time to live for the session
     */
    async updateSession(userData: UserData, sessionId: string, exp: number): Promise<void> {
        const sessionKey = this.getSessionKey(sessionId);

        await this.cacheService.set(sessionKey, userData, convertTimeStampToSeconds(exp));
    }

    // save session and add to whitelist
    /**
     *
     * @param {UserData} userData - The user data to store
     * @param {RefreshToken} refreshToken - The refresh token to store
     * @param {AccessToken} accessToken - The access token to store
     */
    async createNewSession(userData: UserData, refreshToken: RefreshToken, accessToken: AccessToken): Promise<void> {
        const sessionId = refreshToken.sessionId;

        await Promise.all([
            this.storeSession(userData, sessionId, refreshToken.exp),
            this.addToWhitelistToken(
                { jti: refreshToken.jwtId, exp: refreshToken.exp },
                { jti: accessToken.jwtId, exp: accessToken.exp },
            ),
        ]).catch((err) => {
            console.log(err);
        });
    }

    // update session and add to whitelist token and add old token to blacklist\
    /**
     *
     * @param {UserData} userData - The user data to store
     * @param {RefreshToken} refreshToken - The refresh token to store
     * @param {AccessToken} accessToken - The access token to store
     */

    /**
     *
     * @param {userData} userDataOld - The user data to store
     * @param {RefreshToken} refreshToken - The refresh token to store
     * @param {AccessToken} accessToken - The access token to store
     */
    async updateSessionAndAddToWhitelist(
        userDataOld: UserData,
        refreshToken: RefreshToken,
        accessToken: AccessToken,
    ): Promise<void> {
        const sessionId = refreshToken.sessionId;
        const oldRefreshToken = userDataOld.jwtRefreshId;
        const oldAccessToken = userDataOld.jwtAccessId;

        const newUserData: UserData = {
            ...userDataOld,
            jwtRefreshId: refreshToken.jwtId,
            jwtAccessId: accessToken.jwtId,
            expAcc: accessToken.exp,
            expRef: refreshToken.exp,
        };

        await Promise.all([
            this.removeWhitelistToken(oldRefreshToken, oldAccessToken),
            this.updateSession(newUserData, sessionId, refreshToken.exp),
            this.addToWhitelistToken(
                { jti: refreshToken.jwtId, exp: refreshToken.exp },
                { jti: accessToken.jwtId, exp: accessToken.exp },
            ),
            this.addToBlacklistToken(
                { jti: oldRefreshToken, exp: userDataOld.expRef },
                { jti: oldAccessToken, exp: userDataOld.expAcc },
            ),
        ]).catch((err) => {
            console.log(err);
        });
    }

    /**
     *
     * @param {string} sessionId - The session ID
     * @returns {Promise<UserData>} The user data
     */
    async getUserSession(sessionId: string): Promise<UserData> {
        const sessionKey = this.getSessionKey(sessionId);

        return this.cacheService.get<UserData>(sessionKey);
    }

    /**
     *
     * @param {string} userId - The user ID
     * @returns {Promise<UserData[]>} The user data
     */
    async getAllSessions(userId: string): Promise<UserData[]> {
        const userSessionsKey = this.getUserSessionsKey(userId);
        const sessionIds = await this.cacheService.smembers(userSessionsKey);
        const pipeline = this.cacheService.pipeline();

        sessionIds.forEach((sessionId) => {
            pipeline.get(this.getSessionKey(sessionId));
        });

        const sessionData = await pipeline.exec();

        return sessionData
            .filter(([err, result]) => !err && result)
            .map(([, result]) => JSON.parse(result) as UserData);
    }

    /**
     *
     * @param {string} sessionId - The session ID
     */
    async removeSession(sessionId: string): Promise<void> {
        const sessionKey = this.getSessionKey(sessionId);
        const userSessionsKey = this.getUserSessionsKey(sessionId);
        const userData = await this.cacheService.get<UserData>(sessionKey);

        console.log(userData);

        await Promise.all([
            this.cacheService.del(sessionKey),
            this.cacheService.srem(userSessionsKey, sessionId),
            this.addToBlacklistToken(
                { jti: userData.jwtRefreshId, exp: userData.expRef },
                { jti: userData.jwtAccessId, exp: userData.expAcc },
            ),
            this.removeWhitelistToken(userData.jwtRefreshId, userData.jwtAccessId),
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
            const userData = await this.cacheService.get<UserData>(sessionKey);

            await Promise.all([
                this.addToBlacklistToken(
                    { jti: userData.jwtRefreshId, exp: userData.expRef },
                    { jti: userData.jwtAccessId, exp: userData.expAcc },
                ),
                this.removeWhitelistToken(userData.jwtRefreshId, userData.jwtAccessId),
                this.cacheService.del(sessionKey),
                this.cacheService.srem(userSessionsKey, sessionId),
            ]);

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
     * @param {string} sessionId - The session ID
     * @param {string} userId - The user ID
     * @returns {Promise<boolean>} Whether the session is valid
     */
    async validateSession(sessionId: string, userId: string): Promise<boolean> {
        const sessionKey = this.getSessionKey(sessionId);
        const userSessionsKey = this.getUserSessionsKey(userId);

        if (!sessionId || !userId) {
            return false;
        }

        const [sessionExists, userSessionExists] = await Promise.all([
            this.cacheService.checkExist(sessionKey),
            this.cacheService.sismember(userSessionsKey, sessionId),
        ]);

        return sessionExists && userSessionExists;
    }
}
