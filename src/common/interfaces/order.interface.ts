import { HydratedDocument, Types } from 'mongoose';
import { IUser } from './user.interface';
import {
  currencyEnum,
  orderStatusEnum,
  PaymentTypeEnum,
} from '../Enums/order.enum';
import { IProduct } from './product.interface';
import { ICoupon } from './coupon.interface';

export interface IOrderProduct {
  productId: Types.ObjectId | IProduct;
  quantity: number;
  unitAmount: number;
  total: number;
}
export interface IOrder {
  orderId: string;
  intentId?: string;

  address: string;
  phone: string;
  note?: string;

  total: number;
  discountPercent: number;
  subtotal: number;

  status: orderStatusEnum;
  paymentType: PaymentTypeEnum;
  currency: currencyEnum;

  cancel?: { userId: Types.ObjectId; time: Date; reason: string };

  createdBy?: Types.ObjectId | IUser;
  updatedBy?: Types.ObjectId | IUser;

  paidAt?: Date;
  refundedAt?: Date;

  products: IOrderProduct[];
  couponId: Types.ObjectId | ICoupon;

  createdAt?: Date;

  updatedAt?: Date;
  deletedAt?: Date;
  restoredAt?: Date;
}
export type HOrder = HydratedDocument<IOrder>;
/*------------------------------------------------------------------------------------ */
