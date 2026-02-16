import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLE_LEVEL_KEY } from '../decorators';

@Injectable()
export class RoleLevelGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredLevel = this.reflector.getAllAndOverride<number>(
      ROLE_LEVEL_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (requiredLevel === undefined || requiredLevel === null) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.role) {
      throw new ForbiddenException('Access denied');
    }

    if (user.role.level < requiredLevel) {
      throw new ForbiddenException(
        `Required role level: ${requiredLevel} (current: ${user.role.level})`
      );
    }

    return true;
  }
}
