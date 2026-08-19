import { IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

export class confirmOrderDto {
  @IsMongoId()
  orderId!: Types.ObjectId;
}
