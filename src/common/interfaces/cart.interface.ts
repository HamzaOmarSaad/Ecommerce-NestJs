import { HydratedDocument, Types } from 'mongoose';
import { IUser } from './user.interface';
import { IProduct } from './product.interface';

export interface ICartProduct {
  productId: Types.ObjectId | IProduct;
  quantity: number;
}
export interface ICart {
  products: ICartProduct[];

  createdBy?: Types.ObjectId | IUser;

  createdAt?: Date;
  updatedAt?: Date;
}
export type HCart = HydratedDocument<ICart>;
/*------------------------------------------------------------------------------------ */
