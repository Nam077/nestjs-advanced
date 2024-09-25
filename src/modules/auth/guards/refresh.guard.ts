import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { Observable } from 'rxjs';

/**
 *
 */
@Injectable()
export class RefreshGuard extends AuthGuard('refresh') implements CanActivate {
    /**
     *
     * @param {ExecutionContext} context - The execution context
     * @returns {boolean | Promise<boolean> | Observable<boolean>} - The boolean value
     */
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        return super.canActivate(context);
    }
}
