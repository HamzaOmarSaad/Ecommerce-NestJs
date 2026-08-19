import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  IsArray,
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Types } from 'mongoose';
import {
  GenderEnum,
  languageEnum,
  providerEnum,
  RoleEnum,
} from 'src/common/Enums/enums';
import { IUser } from 'src/common/interfaces/user.interface';

export class User {}

registerEnumType(GenderEnum, { name: 'GenderEnum' });
registerEnumType(RoleEnum, { name: 'RoleEnum' });
registerEnumType(providerEnum, { name: 'providerEnum' });
registerEnumType(languageEnum, { name: 'languageEnum' });
@ObjectType()
export class OneUserResponse implements Partial<IUser> {
  @Field(() => ID)
  _id!: Types.ObjectId;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  userName?: string;

  @Field()
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  password?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  phone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  profilePicture?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  profileCoverPicture?: string[];

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDate()
  EmailConfirmedAt?: Date;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDate()
  deletedAt?: Date;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDate()
  restoredAt?: Date;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDate()
  changedCredentialsTime?: Date;

  @Field(() => RoleEnum)
  @IsEnum(RoleEnum)
  role!: RoleEnum;

  @Field(() => providerEnum)
  @IsEnum(providerEnum)
  provider!: providerEnum;

  @Field(() => GenderEnum, { nullable: true })
  @IsOptional()
  @IsEnum(GenderEnum)
  gender?: GenderEnum;

  @Field(() => languageEnum, { nullable: true })
  @IsOptional()
  @IsEnum(languageEnum)
  language?: languageEnum;
}
