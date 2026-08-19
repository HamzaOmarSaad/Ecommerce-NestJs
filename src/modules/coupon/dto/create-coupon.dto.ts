import { CouponTypeEnum } from 'src/common/Enums/coupon.enum';
import { ArgsType, Field, InputType, Int } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import {
  IsDate,
  IsDateString,
  IsEnum,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ICoupon } from 'src/common/interfaces/coupon.interface';
import { Types } from 'mongoose';
import { IUser } from 'src/common/interfaces/user.interface';
import {
  IsDateFuture,
  IsDateInRange,
  ISvalidDiscount,
} from 'src/common/Decorators/validation';

export class CreateCouponDto implements Partial<ICoupon> {
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(5000)
  name!: string;

  @Transform(({ value }) => Number(value))
  @IsEnum(CouponTypeEnum)
  type!: CouponTypeEnum;

  @IsPositive()
  @Transform(({ value }) => Number(value))
  @ISvalidDiscount()
  discount!: number;

  @Transform(({ value }) => Number(value))
  @Min(1)
  @Max(100)
  numberOfUses!: number;

  @IsDateString()
  @IsDateFuture()
  startDate!: Date;

  @IsDateString()
  @IsDateInRange(['startDate'])
  endDate!: Date;
}
