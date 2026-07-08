/* eslint-disable @typescript-eslint/no-unsafe-call */
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import type { RedisClientType } from '@redis/client';
import { Types } from 'mongoose';
import { emailEnum, redisPurposeEnum } from 'src/common/Enums/enums';

type redisOtpType = {
  email: string;
  subject: emailEnum;
};
@Injectable()
export class CacheService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: RedisClientType,
  ) {
    this.handleEvents();
  }

  private handleEvents() {
    this.redisClient.on('error', (error) => {
      console.log('🚀 ~ redisServices ~ handleEvents ~ error:', error);
    });
    this.redisClient.on('ready', () => {
      console.log('🚀 ~ redisServices ~ handleEvents ~ ready');
    });
  }

  public keyPrefixGenerator = ({
    purpose,
    identifier,
  }: {
    purpose: redisPurposeEnum;
    identifier: string;
  }) => {
    return `User::${purpose}::${identifier}`;
  };

  public otpKeyGenerator = ({
    email,
    subject = emailEnum.confirmEmail,
  }: redisOtpType): string => {
    return `${this.keyPrefixGenerator({ purpose: redisPurposeEnum.OTP, identifier: `${email}::${subject}` })}`;
  };

  public maxAttemptOtpKeyGenerator = ({
    email,
    subject = emailEnum.confirmEmail,
  }: redisOtpType): string => {
    return `${this.keyPrefixGenerator({ purpose: redisPurposeEnum.OTP, identifier: `${email}::${subject}` })}::maxTrail`;
  };
  public BlockedOtpKeyGenerator = ({
    email,
    subject = emailEnum.confirmEmail,
  }: redisOtpType): string => {
    return `${this.keyPrefixGenerator({ purpose: redisPurposeEnum.OTP, identifier: `${email}::${subject}` })}::blocked`;
  };

  public revokeTokenGenerator = ({
    jti,
    userId,
  }: {
    jti: string;
    userId: Types.ObjectId;
  }): string => {
    return `${this.keyPrefixGenerator({ purpose: redisPurposeEnum.revokeToken, identifier: userId as unknown as string })}::${jti}`;
  };

  public setValue = async ({
    key,
    value,
    ttl,
  }: {
    key: string;
    value: any;
    ttl: number | undefined;
  }): Promise<string | null> => {
    try {
      const data = JSON.stringify(value);
      if (ttl) {
        return await this.redisClient.set(key, data, {
          expiration: { value: ttl, type: 'EX' },
        });
      } else {
        return await this.redisClient.set(key, data);
      }
    } catch (err) {
      console.log('🚀 ~ redisServices ~ err:', err);
      return null;
    }
  };
  public async getValue<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redisClient.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch {
      throw new BadRequestException('Redis get error');
    }
  }
  public updateValue = async ({
    key,
    newValue,
    ttl,
  }: {
    key: string;
    newValue: string | object;
    ttl: number | undefined;
  }): Promise<string | null | number> => {
    try {
      const exist = await this.redisClient.exists(key);
      if (!exist) {
        return null;
      }
      return await this.setValue({ key, value: newValue, ttl });
    } catch (error) {
      throw new BadRequestException('redis set Error' + error);
    }
  };
  public deleteValue = async ({
    key,
  }: {
    key: string | string[];
  }): Promise<null | number> => {
    try {
      const data = await this.redisClient.del(key);
      return data;
    } catch (error) {
      throw new BadRequestException('redis set Error' + error);
    }
  };

  public expire = async ({
    key,
    ttl,
  }: {
    key: string;
    ttl: number;
  }): Promise<null | number> => {
    try {
      const data = await this.redisClient.expire(key, ttl);
      return data;
    } catch (error) {
      throw new BadRequestException('redis set Error' + error);
    }
  };

  public TTL = async ({ key }: { key: string }): Promise<number> => {
    try {
      return await this.redisClient.ttl(key);
    } catch (error) {
      throw new BadRequestException('redis set Error' + error);
    }
  };

  public async incr(key: string): Promise<number> {
    try {
      return await this.redisClient.incr(key);
    } catch (error) {
      throw new BadRequestException('redis incr Error' + error);
    }
  }
  public async exist(key: string): Promise<number> {
    try {
      return await this.redisClient.exists(key);
    } catch (error) {
      throw new BadRequestException('redis exist Error' + error);
    }
  }
  public GetByPrefix = async (pattern: string): Promise<string[]> => {
    try {
      return await this.redisClient.keys(pattern);
    } catch (error) {
      throw new BadRequestException('redis GetByPrefix Error' + error);
    }
  };
}
