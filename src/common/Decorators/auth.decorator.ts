import { applyDecorators, UseGuards } from '@nestjs/common';
import { Role } from './role.decorator';
import { TokenType, tokenTypeEnum } from '../interfaces/token.types';
import { Token } from './token.decorator';
import { RoleEnum } from '../Enums/enums';
import { AuthorizationGuard } from '../guards/authorization.guard';
import { AuthenticationGuard } from '../guards/authentication.guard';

export const Auth = (
  roles: RoleEnum[],
  token: TokenType = tokenTypeEnum.access,
) => {
  return applyDecorators(
    Token(token),
    Role(roles),
    UseGuards(AuthenticationGuard, AuthorizationGuard),
  );
};
