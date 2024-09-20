import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { Observable } from 'rxjs';

/**
 *
 */
@Injectable()
export class RefreshGuard implements CanActivate {
    /**
     *
     * @param {ExecutionContext} context - The execution context
     * @returns {boolean | Promise<boolean> | Observable<boolean>} - The boolean value
     */
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        context;

        return true;
    }
}
