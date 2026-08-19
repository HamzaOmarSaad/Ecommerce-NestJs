import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IAuthRequest, IContextType } from '../interfaces/auth.interface';
import { TokenType } from '../interfaces/token.interface';
import { TokenService } from '../shared/Token/token.service';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    let request!: IAuthRequest;
    let authorization!: string;
    // to get token type from meta data
    const inputTokenType =
      this.reflector.get<TokenType>('tokenType', context.getHandler()) ||
      this.reflector.get<TokenType>('tokenType', context.getClass());
    if (!inputTokenType) {
      throw new Error('Token type not specified');
    }
    // get request value based on the communication type
    switch (context.getType<IContextType>()) {
      case 'http':
        request = context.switchToHttp().getRequest();
        authorization = request.headers['authorization'] as string;
        break;
      case 'graphql':
        request = GqlExecutionContext.create(context).getContext().req;
        authorization = request.headers['authorization'] as string;
        break;
    }
    if (!authorization) {
      throw new Error('No token provided');
    }
    // get token from header and inject in request
    const [start, token] = authorization.split(' ');

    if (!token) {
      throw new Error('No token provided');
    }
    switch (start) {
      case 'bearer':
        request.credentials = await this.tokenService.decodeToken({
          token,
          tokenType: inputTokenType,
        });
        break;
      case 'basic': {
        const decoded = Buffer.from(token, 'base64')
          .toString('utf-8')
          .split(':');
        const [username, password] = decoded;
        console.log(
          '🚀 ~ AuthenticationGuard ~ canActivate ~ username, password:',
          username,
          password,
        );
        break;
      }
      default:
        throw new Error('Unsupported token type');
    }
    return true;
  }
}
