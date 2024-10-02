import { registerDecorator, ValidateIf, ValidationArguments, ValidationOptions } from 'class-validator';
import { get, has } from 'lodash';

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

/**
 *
 * @param {string} property - The property to match
 * @param {ValidationOptions} [validationOptions] - The validation options
 * @returns {PropertyDecorator} - The property decorator
 */
export const IsMatch =
    (property: string, validationOptions?: ValidationOptions): PropertyDecorator =>
    (object: object, propertyName: string) => {
        registerDecorator({
            name: 'isMatch',
            target: object.constructor,
            propertyName,
            constraints: [property],
            options: validationOptions,
            validator: {
                /**
                 *
                 * @param {any} value - The value
                 * @param {ValidationArguments} args - The validation arguments
                 * @returns {boolean} - The result
                 */
                validate: (value: any, args: ValidationArguments): boolean => {
                    const [relatedPropertyName] = args.constraints;
                    const relatedValue = get(args.object, relatedPropertyName);

                    return value === relatedValue;
                },
                /**
                 *
                 * @param {ValidationArguments} args - The validation arguments
                 * @returns {string} - The default message
                 */
                defaultMessage: (args: ValidationArguments): string =>
                    `${args.property} should match ${args.constraints[0]}`,
            },
        });
    };
