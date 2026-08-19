import { Types } from 'mongoose';
import { currencyEnum, PaymentTypeEnum } from 'src/common/Enums/order.enum';
import { ICoupon } from 'src/common/interfaces/coupon.interface';
import { IOrder, IOrderProduct } from 'src/common/interfaces/order.interface';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  ValidateNested,
  IsArray,
  IsMongoId,
  ValidateIf,
  IsNotEmpty,
  IsPositive,
  matches,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderDto implements Partial<IOrder> {
  @IsString()
  address?: string | undefined;

  @IsString()
  note?: string;

  @Matches(/^(00201 |\+021 |01)(0|1|2|5)\d{8}$/)
  phone!: string;

  @IsEnum(PaymentTypeEnum)
  paymentType!: PaymentTypeEnum;

  @IsEnum(currencyEnum)
  currency!: currencyEnum;

  @IsString()
  @IsOptional()
  couponName?: string;
}
