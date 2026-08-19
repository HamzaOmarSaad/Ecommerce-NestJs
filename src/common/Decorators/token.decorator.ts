import { SetMetadata } from '@nestjs/common';
import { TokenType, tokenTypeEnum } from '../interfaces/token.interface';

// injecting token type so  i can get it in the guard
export const Token = (tokenType: TokenType = tokenTypeEnum.access) =>
  SetMetadata('tokenType', tokenType);
