import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleEnum } from '../Enums/enums';
import { HUser } from '../interfaces/db.type';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): Promise<boolean> | boolean {
    const roles =
      this.reflector.get<RoleEnum[]>('roleName', context.getHandler()) ||
      this.reflector.get<RoleEnum[]>('roleName', context.getClass());

    let user!: HUser;

    switch (context.getType()) {
      case 'http':
        user = context.switchToHttp().getRequest().credentials.user;
        break;
    }
    if (!user) {
      throw new Error('No user found');
    }

    return roles.includes(user.role);
  }
}
