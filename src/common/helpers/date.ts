import { differenceInSeconds, fromUnixTime } from 'date-fns';

/**
 *
 * @param {number} timestamp - The timestamp
 * @returns {number} The seconds
 */
export const convertTimeStampToSeconds = (timestamp: number): number => {
    const date = new Date(timestamp * 1000);
    const now = new Date();

    return differenceInSeconds(date, now);
};

/**
 *
 * @param {number} timestamp - The timestamp
 * @returns {Date} The Date object
 */
export const convertTimeStampToDate = (timestamp: number): Date => {
    return fromUnixTime(timestamp);
};
