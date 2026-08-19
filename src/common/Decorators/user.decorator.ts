import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { HUser } from '../interfaces/user.interface';
import { IAuthRequest, IContextType } from '../interfaces/auth.interface';
import { GqlExecutionContext } from '@nestjs/graphql';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    let user!: HUser;
    switch (ctx.getType<IContextType>()) {
      case 'http':
        user = ctx.switchToHttp().getRequest().credentials.user;
        break;
      case 'graphql': {
        const req: IAuthRequest =
          GqlExecutionContext.create(ctx).getContext().req;
        user = req?.credentials?.user as HUser;
        break;
      }
      default:
        break;
    }
    return user;
  },
);
