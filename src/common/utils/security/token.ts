import { HUser, IUser } from "./../types/db.type";
import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import {
  ACCESS_EXPIRES_IN,
  REFRESH_EXPIRES_IN,
  SYSTEM_JWT_SECRET,
  SYSTEM_JWT_REFRESH_SECRET,
  USER_JWT_REFRESH_SECRET,
  USER_JWT_SECRET,
} from "../../env/config";
import { badReqException } from "../res/exceptions/domain.exceptions";
import { RoleEnum } from "../../Enums/enums";
import redisService from "../redis/redis.service";
import { userRepository } from "../../DB/repos/user.repo";

export const tokenTypeEnum = {
  access: "access",
  refresh: "refresh",
} as const;

export type TokenType = keyof typeof tokenTypeEnum;

type TokenInputType = {
  payload: object;
  options?: SignOptions;
  tokenType: TokenType;
  secret: string;
};
type TokenVerifyType = {
  token: string;
  tokenType: TokenType;
  secret: string;
};

export class TokenService {
  private redisService;
  private userRepo;
  constructor() {
    this.redisService = redisService;
    this.userRepo = userRepository;
  }
  public sign({
    payload,
    options = {},
    secret = USER_JWT_SECRET,
  }: TokenInputType): string {
    return jwt.sign(payload, secret, {
      ...options,
    });
  }
  public verify = ({
    token,
    tokenType,
    secret = USER_JWT_SECRET,
  }: TokenVerifyType) => {
    try {
      if (tokenType === "access" || tokenType === "refresh") {
        return jwt.verify(token, secret);
      }

      throw new badReqException("Invalid token type");
    } catch (err) {
      throw new badReqException("Token verification failed");
    }
  };
  public getSignature = (role: RoleEnum, tokenType: TokenType): string => {
    if (role == RoleEnum.admin) {
      if (tokenType == tokenTypeEnum.access) {
        return SYSTEM_JWT_SECRET;
      } else {
        return SYSTEM_JWT_REFRESH_SECRET;
      }
    }
    if (role == RoleEnum.user) {
      if (tokenType == tokenTypeEnum.access) {
        return USER_JWT_SECRET;
      } else {
        return USER_JWT_REFRESH_SECRET;
      }
    }
    return "";
  };
  public createLoginTokens = ({ iss, user }: { iss: string; user: HUser }) => {
    const jwtId = crypto.randomUUID();
    const signature = this.getSignature(user.role, tokenTypeEnum.access);

    const accessToken = this.sign({
      payload: { _id: user._id },
      tokenType: tokenTypeEnum.access,
      secret: signature,

      options: {
        expiresIn: ACCESS_EXPIRES_IN,
        issuer: iss,
        jwtid: jwtId,
        audience: [tokenTypeEnum.access, user.role as unknown as string],
      },
    });
    const refreshToken = this.sign({
      payload: { _id: user._id },
      tokenType: tokenTypeEnum.refresh,
      secret: signature,

      options: {
        expiresIn: REFRESH_EXPIRES_IN,
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
    const decoded = jwt.decode(token) as JwtPayload;
    if (!decoded?.aud?.length) {
      throw new badReqException("missing token audience ");
    }
    const [tokenApproach, signatureLevel] = decoded.aud;
    if (tokenApproach == undefined || signatureLevel == undefined) {
      throw new badReqException("missing token audience ");
    }
    if (tokenApproach != tokenType) {
      throw new badReqException(" wrong  token type ");
    }
    const isBanned = await this.redisService.getValue(
      this.redisService.revokeTokenGenerator({
        userId: decoded._id,
        jti: decoded.jti as string,
      }),
    );

    if (isBanned) {
      throw new badReqException("No token provided");
    }

    const secret = this.getSignature(
      signatureLevel as unknown as RoleEnum,
      tokenApproach,
    );
    const verifiedData = this.verify({ token, secret, tokenType });

    const user = await this.userRepo.findOne({ _id: verifiedData.sub });

    if (!user) {
      throw new badReqException("No token provided");
    }

    if (
      user.changedCredentialsTime &&
      decoded.iat &&
      user.changedCredentialsTime.getTime() >= decoded.iat * 1000
    ) {
      throw new badReqException("No token provided");
    }
    //!6)inject user info into request to be used in operations
    return { decoded, user };
  };
}
