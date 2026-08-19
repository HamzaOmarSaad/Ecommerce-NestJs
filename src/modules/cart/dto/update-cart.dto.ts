import { PartialType } from '@nestjs/mapped-types';
import { CreateCartDto } from './create-cart.dto';
import { Types } from 'mongoose';
import { ArrayUnique, IsArray, IsMongoId } from 'class-validator';

export class UpdateCartDto extends PartialType(CreateCartDto) {}
export class removeItemFromCartDto {
  @IsArray()
  @IsMongoId({ each: true })
  @ArrayUnique()
  productIds!: Types.ObjectId[];
}
