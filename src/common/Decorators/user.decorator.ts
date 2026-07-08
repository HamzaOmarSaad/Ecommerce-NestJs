import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { HUser } from '../interfaces/db.type';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    let user!: HUser;
    switch (ctx.getType()) {
      case 'http':
        user = ctx.switchToHttp().getRequest().credentials.user;
        break;
      default:
        break;
    }
    return user;
  },
);
