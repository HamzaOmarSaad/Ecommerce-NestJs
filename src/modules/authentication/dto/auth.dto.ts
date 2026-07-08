import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { Match } from 'src/common/Decorators';

// export type signupDTO = z.infer<typeof signupSchema.body>;
// export type loginDTO = z.infer<typeof loginSchema.body>;

export class resendEmailDTO {
  @IsEmail()
  email!: string;
}
export class confirmEmailDTO extends resendEmailDTO {
  @Matches(/^[0-9]{6}$/, {
    message: 'OTP must be a 6-digit number',
  })
  @IsNotEmpty()
  otp!: number;
}
export class forgetPasswordDTO extends resendEmailDTO {
  @IsStrongPassword({
    minNumbers: 3,
    minUppercase: 1,
    minLowercase: 1,
    minSymbols: 1,
  })
  password!: string;
}

export class loginDTO extends resendEmailDTO {
  @IsStrongPassword({
    minNumbers: 3,
    minUppercase: 1,
    minLowercase: 1,
    minSymbols: 1,
  })
  password!: string;

  @IsOptional()
  @IsString()
  FCM?: string;
}
export class signupDTO extends loginDTO {
  @IsString()
  @MaxLength(55)
  @IsNotEmpty()
  userName!: string;

  //   @Validate(matchPassword<string>)
  @ValidateIf((data: any) => {
    return Boolean(data.password);
  })
  @Match<string>(['password'])
  confirmPassword!: string;

  @IsOptional()
  phone?: string;
}

export class signupQueryDTO {
  @Transform(() => {})
  flag!: boolean;
}

export class signupWithGmailDTO {
  @IsString()
  @IsNotEmpty()
  idToken!: string;
}
