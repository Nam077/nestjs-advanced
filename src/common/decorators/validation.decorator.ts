import { ValidationOptions, ValidateIf } from 'class-validator';
import { has } from 'lodash';

/**
 *
 * @param {ValidationOptions} [options] - The validation options
 * @returns {PropertyDecorator} - The property decorator
 */
export const IsOptionalCustom = (options?: ValidationOptions): PropertyDecorator => {
    return (prototype: object, propertyKey: string | symbol): void => {
        ValidateIf((object) => object != null && has(object, propertyKey), options)(prototype, propertyKey);
    };
};
