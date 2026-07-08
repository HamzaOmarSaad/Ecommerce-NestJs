//replaced by guards

import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TokenService } from '../shared/Token/token.service';
import { tokenTypeEnum } from '../interfaces/token.types';

@Injectable()
export class AuthenticationMiddleware implements NestMiddleware {
  constructor(private readonly tokenService: TokenService) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const authorization = req.headers['authorization'];

    if (!authorization) {
      throw new BadRequestException('No token provided');
    }

    const [start, token] = authorization.split(' ');
    if (start != 'bearer') {
      throw new BadRequestException('Wrong token format');
    }
    if (!token) {
      throw new BadRequestException('No token provided');
    }
    const { user, decoded } = await this.tokenService.decodeToken({
      token,
      tokenType: tokenTypeEnum.access,
    });
    // req.user = user;
    // req.decoded = decoded;
    console.log(
      '🚀 ~ AuthenticationMiddleware ~ use ~  user, decoded:',
      user,
      decoded,
    );

    next();
  }
}
