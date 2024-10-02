import { compareSync, hashSync } from 'bcryptjs';

/**
 * HashService class
 */
class HashService {
    private readonly saltRounds = 10;
    protected static instance: HashService;
    /**
     * Get the instance of the HashService
     * @returns {HashService} - The instance of the HashService
     */
    public static getInstance(): HashService {
        if (!HashService.instance) {
            HashService.instance = new HashService();
        }

        return HashService.instance;
    }

    /**
     * HashService constructor
     */
    private constructor() {}

    /**
     * Hash the given data
     * @param {string} data - The data to hash
     * @returns {string} - The hashed data
     */
    public hash(data: string): string {
        return hashSync(data, this.saltRounds);
    }

    /**
     * Compare the given data with the hashed data
     * @param {string} data - The data to compare
     * @param {string} hashedData - The hashed data to compare
     * @returns {boolean} - The result of the comparison
     * @memberof HashService
     */
    public compare(data: string, hashedData: string): boolean {
        return compareSync(data, hashedData);
    }
}
export const hashServiceInstance = HashService.getInstance();
