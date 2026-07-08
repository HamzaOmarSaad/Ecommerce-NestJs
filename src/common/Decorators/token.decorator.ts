import { SetMetadata } from '@nestjs/common';
import { TokenType, tokenTypeEnum } from './../interfaces/token.types';
export const Token = (tokenType: TokenType = tokenTypeEnum.access) =>
  SetMetadata('tokenType', tokenType);
