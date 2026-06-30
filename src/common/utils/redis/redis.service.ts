import { createClient, RedisClientType } from "redis";
import { REDIS_DB_NAME, REDIS_DB_URI } from "../../env/config";
import { badReqException } from "../res/exceptions/domain.exceptions";
import { emailEnum, redisPurposeEnum } from "../../Enums/enums";
import { Types } from "mongoose";
// singleton pattern
type redisOtpType = {
  email: string;
  subject: emailEnum;
};
export class redisServices {
  private readonly redisClient: RedisClientType;
  constructor() {
    this.redisClient = createClient({
      url: REDIS_DB_URI,
      database: REDIS_DB_NAME,
    });
    this.handleEvents();
  }

  public connectRedisDB = async () => {
    try {
      await this.redisClient.connect();
      console.log("🚀 ~ redis connected successfully");
    } catch (error) {
      console.log("🚀 ~ redis connectDB ~ error:", error);
    }
  };

  private handleEvents() {
    this.redisClient.on("error", (error) => {
      console.log("🚀 ~ redisServices ~ handleEvents ~ error:", error);
    });
    this.redisClient.on("ready", () => {
      console.log("🚀 ~ redisServices ~ handleEvents ~ ready");
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
          expiration: { value: ttl, type: "EX" },
        });
      } else {
        return await this.redisClient.set(key, data);
      }
    } catch (err) {
      console.log("🚀 ~ redisServices ~ err:", err);
      return null;
    }
  };
  public async getValue<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redisClient.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch {
      throw new badReqException("Redis get error");
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
      throw new badReqException("redis set Error");
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
      throw new badReqException("redis set Error");
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
      throw new badReqException("redis set Error");
    }
  };

  public TTL = async ({ key }: { key: string }): Promise<number> => {
    try {
      return await this.redisClient.ttl(key);
    } catch (error) {
      throw new badReqException("redis set Error");
    }
  };

  public async incr(key: string): Promise<number> {
    try {
      return await this.redisClient.incr(key);
    } catch (error) {
      throw new badReqException("redis incr Error");
    }
  }
  public async exist(key: string): Promise<number> {
    try {
      return await this.redisClient.exists(key);
    } catch (error) {
      throw new badReqException("redis exist Error" + error);
    }
  }
  public GetByPrefix = async (pattern: string): Promise<string[]> => {
    try {
      return await this.redisClient.keys(pattern);
    } catch (error) {
      throw new badReqException("redis GetByPrefix Error");
    }
  };
}
const redisService = new redisServices();

export default redisService;
