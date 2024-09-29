import { createParamDecorator, ExecutionContext, SetMetadata, UnauthorizedException } from '@nestjs/common';

import { get } from 'lodash';

export const IS_PUBLIC_KEY = 'isPublic';
/**
 * Public decorator is used to mark a route as public.
 * @returns {ReturnType<typeof SetMetadata>} - The metadata to mark a route as public
 */
export const Public = (): ReturnType<typeof SetMetadata> => SetMetadata(IS_PUBLIC_KEY, true);

/**
 * Custom decorator để lấy thông tin người dùng hiện tại từ request.
 * @template T - Kiểu của đối tượng người dùng.
 * @returns {ParameterDecorator} - Thông tin người dùng hiện tại.
 * @throws {UnauthorizedException} - Ném một ngoại lệ UnauthorizedException nếu không tìm thấy người dùng.
 */
export function CurrentUser<T>(): ParameterDecorator {
    return createParamDecorator<keyof T | undefined, ExecutionContext>(
        (data: keyof T, ctx: ExecutionContext): T | T[keyof T] => {
            const request = ctx.switchToHttp().getRequest();
            const user = request.user as T;

            // if (!user) {
            //     throw new UnauthorizedException('User not found');
            // }

            return data ? get(user, data) : user;
        },
    )();
}
