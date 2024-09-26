/**
 * Enum for key type
 * @enum {string}
 * @name KeyType
 * @property {string} ACCESS_KEY - The access key
 * @property {string} REFRESH_KEY - The refresh key
 */
export enum KeyType {
    ACCESS_KEY = 'access_key',
    REFRESH_KEY = 'refresh_key',
    CONFIRMATION_USER_KEY = 'confirmation_user_key',
    RESET_PASSWORD_KEY = 'reset_password_key',
}
