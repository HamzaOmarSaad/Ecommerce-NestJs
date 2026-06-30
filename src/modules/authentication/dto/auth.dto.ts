/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { Match } from 'src/common/Decorators';

// export type signupDTO = z.infer<typeof signupSchema.body>;
// export type loginDTO = z.infer<typeof loginSchema.body>;

export class loginDTO {
  @IsEmail()
  email!: string;

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
