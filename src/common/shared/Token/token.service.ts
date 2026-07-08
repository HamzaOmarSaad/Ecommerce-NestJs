import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import crypto from 'crypto';
import { JwtPayload, SignOptions } from 'jsonwebtoken';

import {
  TokenInputType,
  TokenType,
  tokenTypeEnum,
  TokenVerifyType,
} from 'src/common/interfaces/token.types';
import { CacheService } from '../redis/caching.service';
import { UserRepo } from 'src/common/repos';
import { RoleEnum } from 'src/common/Enums/enums';
import { HUser } from 'src/common/interfaces/db.type';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenService {
  private USER_JWT_SECRET: string;
  private USER_JWT_REFRESH_SECRET: string;
  private SYSTEM_JWT_SECRET: string;
  private SYSTEM_JWT_REFRESH_SECRET: string;
  private ACCESS_EXPIRES_IN: number;
  private REFRESH_EXPIRES_IN: number;

  constructor(
    private redisService: CacheService,
    private userRepository: UserRepo,
    private readonly ConfigService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.USER_JWT_SECRET = this.ConfigService.get<string>(
      'USER_JWT_SECRET',
    ) as string;
    this.USER_JWT_REFRESH_SECRET = this.ConfigService.get<string>(
      'USER_JWT_REFRESH_SECRET',
    ) as string;
    this.SYSTEM_JWT_SECRET = this.ConfigService.get<string>(
      'SYSTEM_JWT_SECRET',
    ) as string;
    this.SYSTEM_JWT_REFRESH_SECRET = this.ConfigService.get<string>(
      'SYSTEM_JWT_REFRESH_SECRET',
    ) as string;
    this.ACCESS_EXPIRES_IN = this.ConfigService.get<number>(
      'ACCESS_EXPIRES_IN',
    ) as number;
    this.REFRESH_EXPIRES_IN = this.ConfigService.get<number>(
      'REFRESH_EXPIRES_IN',
    ) as number;
  }

  public sign({
    payload,
    options = {},
    secret = this.USER_JWT_SECRET,
  }: TokenInputType): Promise<string> {
    try {
      return this.jwtService.signAsync(payload, {
        secret,
        ...(options as SignOptions),
      });
    } catch (error) {
      throw new BadRequestException('Token signing failed: ' + error);
    }
  }
  public verify = ({
    token,
    tokenType,
    secret = this.USER_JWT_SECRET,
  }: TokenVerifyType): Promise<JwtPayload> => {
    try {
      if (tokenType === 'access' || tokenType === 'refresh') {
        return this.jwtService.verifyAsync(token, { secret });
      }

      throw new BadRequestException('Invalid token type');
    } catch (err) {
      throw new BadRequestException('Token verification failed' + err);
    }
  };
  public getSignature = (role: RoleEnum, tokenType: TokenType): string => {
    if (role == RoleEnum.admin) {
      if (tokenType == tokenTypeEnum.access) {
        return this.SYSTEM_JWT_SECRET;
      } else {
        return this.SYSTEM_JWT_REFRESH_SECRET;
      }
    }
    if (role == RoleEnum.user) {
      if (tokenType == tokenTypeEnum.access) {
        return this.USER_JWT_SECRET;
      } else {
        return this.USER_JWT_REFRESH_SECRET;
      }
    }
    return '';
  };
  public createLoginTokens = async ({
    iss,
    user,
  }: {
    iss: string;
    user: HUser;
  }): Promise<{ accessToken: string; refreshToken: string }> => {
    const jwtId = crypto.randomUUID();
    const signature = this.getSignature(user.role, tokenTypeEnum.access);

    const accessToken = await this.sign({
      payload: { _id: user._id },
      tokenType: tokenTypeEnum.access,
      secret: signature,

      options: {
        expiresIn: this.ACCESS_EXPIRES_IN,
        issuer: iss,
        jwtid: jwtId,
        audience: [tokenTypeEnum.access, user.role as unknown as string],
      },
    });
    const refreshToken = await this.sign({
      payload: { _id: user._id },
      tokenType: tokenTypeEnum.refresh,
      secret: signature,

      options: {
        expiresIn: this.REFRESH_EXPIRES_IN,
        issuer: iss,
        jwtid: jwtId,
        audience: [tokenTypeEnum.refresh, user.role as unknown as string],
      },
    });

    return { accessToken, refreshToken };
  };
  public decodeToken = async ({
    token,
    tokenType,
  }: {
    token: string;
    tokenType: TokenType;
  }): Promise<{ user: HUser; decoded: JwtPayload }> => {
    const decoded: JwtPayload = this.jwtService.decode(token);

    if (!decoded || typeof decoded === 'string') {
      throw new BadRequestException('Invalid token');
    }
    if (!decoded?.aud?.length) {
      throw new BadRequestException('missing token audience ');
    }
    const [tokenApproach, signatureLevel] = decoded.aud;
    if (tokenApproach == undefined || signatureLevel == undefined) {
      throw new BadRequestException('missing token audience ');
    }
    if (tokenApproach != tokenType) {
      throw new BadRequestException(' wrong  token type ');
    }
    const isBanned = await this.redisService.getValue(
      this.redisService.revokeTokenGenerator({
        userId: decoded._id,
        jti: decoded.jti as string,
      }),
    );

    if (isBanned) {
      throw new BadRequestException('No token provided');
    }

    const secret = this.getSignature(
      signatureLevel as unknown as RoleEnum,
      tokenApproach,
    );
    const verifiedData = await this.verify({ token, secret, tokenType });

    const user = await this.userRepository.findOne({ _id: verifiedData.sub });

    if (!user) {
      throw new BadRequestException('No token provided');
    }

    if (
      user.changedCredentialsTime &&
      decoded.iat &&
      user.changedCredentialsTime.getTime() >= decoded.iat * 1000
    ) {
      throw new BadRequestException('No token provided');
    }
    //!6)inject user info into request to be used in operations
    return { decoded, user };
  };
}
