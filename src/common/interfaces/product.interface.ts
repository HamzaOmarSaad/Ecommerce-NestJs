import { HydratedDocument, Types } from 'mongoose';
import { IUser } from './user.interface';
import { IBrand } from './brand.interface';
import { ICategory } from './category.interface';

// how to implement product variance (small-large)

export interface IProduct {
  productId: string;
  name: string;
  slug: string;
  description: string;

  price: number;
  salePrice?: number;
  discount?: number;
  finalPrice: number;

  stock: number;
  rating?: number;

  image?: string;
  gallery?: string[];

  deletedAt?: Date;
  restoredAt?: Date;

  createdBy?: Types.ObjectId | IUser;
  updatedBy?: Types.ObjectId | IUser;

  brandId?: Types.ObjectId | IBrand;
  categoryId?: Types.ObjectId | ICategory;

  interestedUsers?: Types.ObjectId[] | IUser[];

  createdAt?: Date;
  updatedAt?: Date;
}
export type HProduct = HydratedDocument<IProduct>;
/*------------------------------------------------------------------------------------ */
