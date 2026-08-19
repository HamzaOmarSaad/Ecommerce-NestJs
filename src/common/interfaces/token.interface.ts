import { SignOptions } from 'jsonwebtoken';
export const tokenTypeEnum = {
  access: 'access',
  refresh: 'refresh',
} as const;

export type TokenType = keyof typeof tokenTypeEnum;

export type TokenInputType = {
  payload: object;
  options?: SignOptions;
  tokenType: TokenType;
  secret: string;
};
export type TokenVerifyType = {
  token: string;
  tokenType: TokenType;
  secret: string;
};
