import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const roles = this.reflector.get<string[]>('roles', context.getHandler());

    console.log("roles", roles);

    if (!roles || !user) {
      return false;
    }

    return roles.every(role => (user[role] ? true : false));
  }
}
