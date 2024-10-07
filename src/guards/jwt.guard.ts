import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

import { Observable } from 'rxjs';

import { IS_PUBLIC_KEY } from '@/common';

/**
 * JwtAuthGuard is responsible for protecting routes using JWT tokens.
 * It uses the 'jwt' strategy defined in JwtStrategy.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') implements CanActivate {
    /**
     * @description Constructor of JwtAuthGuard.
     * @param {Reflector} reflector - The reflector instance to retrieve metadata.
     */
    constructor(private readonly reflector: Reflector) {
        super();
    }

    /**
     * @description Determines if the route is public or protected.
     * @param {ExecutionContext} context - The execution context of the request
     * @returns {boolean | Promise<boolean> | Observable<boolean>} - A boolean indicating if the route is public or protected
     */
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const isPublic = this.reflector.get<boolean>(IS_PUBLIC_KEY, context.getHandler());

        if (isPublic) {
            return true;
        }

        return super.canActivate(context);
    }
}
