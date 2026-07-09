import { ConfigService } from '@nestjs/config';
import { TokenService } from './../../common/shared/Token/token.service';
import { EmailService } from './../../common/shared/email/email.service';
import {
  Injectable,
  Body,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import {
  confirmEmailDTO,
  loginDTO,
  resendEmailDTO,
  signupDTO,
} from './dto/auth.dto';
import { UserRepo } from 'src/common/repos';
import {
  emailEnum,
  GenderEnum,
  providerEnum,
  RoleEnum,
} from 'src/common/Enums/enums';
import { CacheService } from 'src/common/shared/redis/caching.service';
import { securityService } from 'src/common/shared/security/security.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { HUser, IUser } from 'src/common/interfaces/db.type';
import { OAuth2Client } from 'google-auth-library/build/src/auth/oauth2client';
import { LoginResponse } from './entities/auth.entities';
import { TokenPayload } from 'google-auth-library';

@Injectable()
export class authService {
  constructor(
    private readonly userRepository: UserRepo,
    private readonly cacheService: CacheService,
    private readonly emailService: EmailService,
    private readonly securityService: securityService,
    private readonly tokenService: TokenService,
    private readonly eventEmitter: EventEmitter2,
    private readonly ConfigService: ConfigService,
  ) {}

  private async sendEmailOTP({
    email,
    subject,
    title,
  }: {
    email: string;
    subject: emailEnum;
    title: string;
  }): Promise<void> {
    const blockedKey = this.cacheService.BlockedOtpKeyGenerator({
      email,
      subject,
    });

    const otpKey = this.cacheService.otpKeyGenerator({
      email,
      subject,
    });

    const attemptsKey = this.cacheService.maxAttemptOtpKeyGenerator({
      email,
      subject,
    });

    // check if blocked
    const isBlockedTTL = await this.cacheService.TTL({
      key: blockedKey,
    });

    if (isBlockedTTL > 0) {
      throw new BadRequestException(
        `Sorry, you are blocked. Try again after ${isBlockedTTL} seconds`,
      );
    }

    const remainingOtpTTL = await this.cacheService.TTL({
      key: otpKey,
    });

    if (remainingOtpTTL > 0) {
      throw new BadRequestException(
        `Current OTP still active. Try again after ${remainingOtpTTL} seconds`,
      );
    }

    const attempts = await this.cacheService.incr(attemptsKey);

    if (attempts === 1) {
      await this.cacheService.expire({ key: attemptsKey, ttl: 300 });
    }

    if (attempts > 3) {
      await this.cacheService.setValue({
        key: blockedKey,
        value: 1,
        ttl: 7 * 60,
      });

      throw new BadRequestException('Sorry, you have reached the limit');
    }

    const code = Math.floor(Math.random() * 900000 + 100000);

    await this.cacheService.setValue({
      key: otpKey,
      value: await this.securityService.hashService(String(code)),
      ttl: 120,
    });

    this.eventEmitter.emit('confirm-Email', {
      to: email,
      subject: title,
      html: this.emailService.email_template({
        message: String(code),
        title,
      }),
    });
  }
  public async confirmEmailOTP({ email, otp }: confirmEmailDTO): Promise<void> {
    const key: string = this.cacheService.otpKeyGenerator({
      email,
      subject: emailEnum.confirmEmail,
    });
    // get db value
    const hashed = await this.cacheService.getValue<string>(key);

    if (!hashed) {
      throw new BadRequestException(`wrong otp`);
    }
    // check email correctness
    const account = await this.userRepository.findOne({
      email,
      isEmailConfirmed: { $exists: false },
      provider: providerEnum.system,
    });
    if (!account) {
      throw new BadRequestException(` email not found  `);
    }
    // compare OTPs
    const match = await this.securityService.verifyHashService(
      otp.toString(),
      hashed,
    );

    if (!match) {
      throw new BadRequestException(`wrong otp`);
    }
    //confirm email is done
    account.isEmailConfirmed = new Date();
    await account.save();
    await this.cacheService.deleteValue({ key });
  }
  public async resendEmailOTP({ email }: resendEmailDTO): Promise<void> {
    // check email correctness
    const account = await this.userRepository.findOne({
      email,
      isEmailConfirmed: { $exists: false },
      provider: providerEnum.system,
    });
    if (!account) {
      throw new BadRequestException(` email not found  `);
    }
    await this.sendEmailOTP({
      email,
      subject: emailEnum.confirmEmail,
      title: 'email confirmation',
    });
    return;
  }

  public async Signup({
    userName,
    email,
    password,
    phone,
  }: signupDTO): Promise<IUser> {
    const isEmail = await this.userRepository.findOne({ email });
    if (isEmail) {
      throw new BadRequestException('email already exist');
    }
    const hashedPass = await this.securityService.hashService(password);
    const encryptedPhone = this.securityService.encryptService(phone as string);
    const data = {
      userName,
      email,
      gender: GenderEnum.male,
      role: RoleEnum.user,
      password: hashedPass,
      provider: providerEnum.system,
      phone: encryptedPhone,
    };
    const user = await this.userRepository.create(data);
    if (!user) throw new ConflictException('fail');
    await this.sendEmailOTP({
      email,
      subject: emailEnum.confirmEmail,
      title: 'email confirmation',
    });

    return user;
  }
  public async login(inputs: loginDTO, issuer: string): Promise<LoginResponse> {
    const { email, password } = inputs;
    const user = await this.userRepository.findOne({ email });
    if (!user) {
      throw new BadRequestException('wrong credential');
    }
    const passMatch = await this.securityService.verifyHashService(
      password,
      user.password as string,
    );
    if (!passMatch) {
      throw new BadRequestException('wrong credential');
    }
    const { accessToken, refreshToken } =
      await this.tokenService.createLoginTokens({
        user: user,
        iss: issuer,
      });

    return { accessToken, refreshToken };
  }
  private async VerifyGoogleAccount(
    googleToken: string,
  ): Promise<TokenPayload> {
    const GoogleClient = new OAuth2Client(this.ConfigService.get('CLIENT_ID'));

    const ticket = await GoogleClient.verifyIdToken({
      idToken: googleToken,
      audience: this.ConfigService.get('CLIENT_ID'),
    });
    const payload = ticket.getPayload();
    if (!payload?.email_verified) {
      throw new BadRequestException('invalid token payload');
    }
    return payload;
  }
  public LoginWithGoogle = async (
    googleToken: string,
    iss: string,
  ): Promise<LoginResponse> => {
    const payload = await this.VerifyGoogleAccount(googleToken);

    const isEmailExist = await this.userRepository.findByEmail(
      payload?.email as string,
    );
    if (!isEmailExist) {
      throw new NotFoundException('invalid token payload');
    }
    if (isEmailExist.provider != providerEnum.google) {
      throw new ConflictException('wrong provider use system login ');
    }
    const { accessToken, refreshToken } =
      await this.tokenService.createLoginTokens({
        iss,
        user: isEmailExist,
      });

    return { accessToken, refreshToken };
  };
  public signupWithGoogle = async (
    googleToken: string,
    iss: string,
  ): Promise<{
    credentials: LoginResponse;
    status: number;
  }> => {
    const payload = await this.VerifyGoogleAccount(googleToken);

    const isEmailExist = await this.userRepository.findByEmail(
      payload?.email as string,
    );

    if (isEmailExist) {
      if (isEmailExist.provider != providerEnum.google) {
        throw new ConflictException('wrong provider use system login ');
      }
      return {
        credentials: await this.LoginWithGoogle(googleToken, iss),
        status: 200,
      };
    }
    // sign up
    const data = {
      userName: payload.name as string,
      email: payload.email as string,
      provider: providerEnum.google,
      isEmailConfirmed: new Date(),
      role: RoleEnum.user,
    };
    const newUser: HUser = await this.userRepository.create(data);

    const { accessToken, refreshToken } =
      await this.tokenService.createLoginTokens({
        iss,
        user: newUser,
      });

    return { credentials: { accessToken, refreshToken }, status: 201 };
  };
}
