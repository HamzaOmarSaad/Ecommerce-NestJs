import { applyDecorators, UseGuards } from '@nestjs/common';
import { Role } from './role.decorator';
import { TokenType } from '../interfaces/token.types';
import { Token } from './token.decorator';
import { RoleEnum } from '../Enums/enums';
import { AuthorizationGuard } from '../guards/authorization.guard';
import { AuthenticationGuard } from '../guards/authentication.guard';

export const Auth = (roles: RoleEnum[], token: TokenType) => {
  return applyDecorators(
    Token(token),
    Role(roles),
    UseGuards(AuthenticationGuard, AuthorizationGuard),
  );
};
