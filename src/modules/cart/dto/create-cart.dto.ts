import { IsInt, IsMongoId } from 'class-validator';
import { Types } from 'mongoose';
import { ICartProduct } from 'src/common/interfaces/cart.interface';
import { IProduct } from 'src/common/interfaces/product.interface';

export class CreateCartDto implements ICartProduct {
  @IsMongoId()
  productId!: Types.ObjectId | IProduct;
  @IsInt()
  quantity!: number;
}
