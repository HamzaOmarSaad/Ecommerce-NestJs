import { HydratedDocument, Types } from 'mongoose';
import { IUser } from './user.interface';
import { CouponTypeEnum } from '../Enums/coupon.enum';

export interface ICoupon {
  name: string;
  slug: string;

  type: CouponTypeEnum;
  discount: number;

  usedBy: {
    userId: Types.ObjectId | IUser;
    orderId: Types.ObjectId;
    time: Date;
  }[];

  startDate: Date;
  endDate: Date;
  numberOfUses: number;

  createdBy?: Types.ObjectId | IUser;

  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  restoredAt?: Date;
}
export type HCoupon = HydratedDocument<ICoupon>;
/*------------------------------------------------------------------------------------ */
