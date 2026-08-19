import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleEnum } from '../Enums/enums';
import { HUser, IUser } from '../interfaces/user.interface';
import { IAuthRequest, IContextType } from '../interfaces/auth.interface';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): Promise<boolean> | boolean {
    const roles =
      this.reflector.get<RoleEnum[]>('roleName', context.getHandler()) ||
      this.reflector.get<RoleEnum[]>('roleName', context.getClass());

    let user!: HUser;

    switch (context.getType<IContextType>()) {
      case 'http':
        user = context.switchToHttp().getRequest()?.credentials?.user;
        break;
      case 'graphql': {
        const req: IAuthRequest =
          GqlExecutionContext.create(context).getContext().req;
        user = req?.credentials?.user as HUser;
        break;
      }
    }
    if (!user) {
      throw new Error('No user found');
    }

    return roles.includes(user.role);
  }
}
