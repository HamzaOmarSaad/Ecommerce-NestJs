import {
  MongooseModule,
  Prop,
  raw,
  Schema,
  SchemaFactory,
} from '@nestjs/mongoose';
import { Types } from 'mongoose';
import {
  orderStatusEnum,
  PaymentTypeEnum,
  currencyEnum,
} from 'src/common/Enums/order.enum';
import { ICoupon } from 'src/common/interfaces/coupon.interface';
import {
  HOrder,
  IOrder,
  IOrderProduct,
} from 'src/common/interfaces/order.interface';
import { IUser } from 'src/common/interfaces/user.interface';
import { generateSlug } from 'src/common/utils/slug';

@Schema({
  timestamps: true,
  strict: true,
  strictQuery: true,
  toJSON: { virtuals: true, getters: true },
  toObject: { virtuals: true, getters: true },
})
export class Order implements IOrder {
  @Prop({
    type: String,
    required: true,
    unique: true,
  })
  orderId!: string;

  @Prop({
    type: String,
  })
  intentId?: string | undefined;

  @Prop({
    type: String,
    required: true,
  })
  address!: string;

  @Prop({
    type: String,
    required: true,
  })
  phone!: string;

  @Prop({
    type: String,
  })
  note?: string | undefined;

  @Prop({
    type: Number,
    required: true,
    default: 0,
  })
  total!: number;

  @Prop({
    type: Number,
    default: 0,
  })
  discountPercent!: number;

  @Prop({
    type: Number,
    required: true,
    default: 0,
  })
  subtotal!: number;

  @Prop({
    type: Number,
    enum: orderStatusEnum,
    required: true,
    default: orderStatusEnum.PENDING,
  })
  status!: orderStatusEnum;

  @Prop({
    type: Number,
    enum: PaymentTypeEnum,
    required: true,
  })
  paymentType!: PaymentTypeEnum;

  @Prop({
    type: String,
    enum: currencyEnum,
    required: true,
  })
  currency!: currencyEnum;

  @Prop(
    raw({
      type: {
        userId: { type: Types.ObjectId, ref: 'Users', required: true },
        time: Date,
        reason: String,
      },
    }),
  )
  cancel?: { userId: Types.ObjectId; time: Date; reason: string } | undefined;

  @Prop({
    type: Date,
  })
  paidAt?: Date | undefined;

  @Prop({
    type: Date,
  })
  refundedAt?: Date | undefined;

  @Prop([
    raw({
      productId: {
        type: Types.ObjectId,
        ref: 'Products',
        required: true,
        unique: true,
      },
      quantity: {
        type: Number,
        min: 1,
        required: true,
      },
      total: {
        type: Number,
        min: 1,
        required: true,
      },
      unitAmount: {
        type: Number,
        min: 1,
        required: true,
      },
    }),
  ])
  products!: IOrderProduct[];

  @Prop({
    type: Types.ObjectId,
    ref: 'Coupon',
  })
  couponId!: Types.ObjectId | ICoupon;

  @Prop({
    type: Date,
  })
  deletedAt?: Date | undefined;

  @Prop({
    type: Date,
  })
  restoredAt?: Date | undefined;

  @Prop({
    type: Types.ObjectId,
    ref: 'Users',
    required: true,
  })
  createdBy!: Types.ObjectId | IUser;

  @Prop({
    type: Types.ObjectId,
    ref: 'Users',
  })
  updatedBy?: Types.ObjectId | IUser;
  createdAt?: Date | undefined;
  updatedAt?: Date | undefined;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

const OrderModel = MongooseModule.forFeatureAsync([
  {
    name: Order.name,
    useFactory: () => {
      OrderSchema.pre(['deleteOne', 'findOneAndDelete'], function () {
        if (this.getQuery().force == true) {
          this.setQuery({
            ...this.getQuery(),
          });
        } else {
          this.setQuery({
            ...this.getQuery(),
            deleteAt: { $exists: true },
          });
        }
      });
      OrderSchema.pre(['find', 'findOne'], function () {
        if (this.getQuery().paranoid == false) {
          this.setQuery({
            ...this.getQuery(),
          });
        } else {
          this.setQuery({
            ...this.getQuery(),
            deleteAt: { $exists: true },
          });
        }
      });
      OrderSchema.pre(['updateOne', 'findOneAndUpdate'], function () {
        const update = this.getUpdate() as HOrder;
        if (update.deletedAt) {
          this.getQuery().paranoid = true;
          this.setUpdate({
            ...this.getUpdate(),
            $unset: { restoredAt: 1 },
          });
        }
        if (update.restoredAt) {
          this.setQuery({
            ...this.getQuery(),
            deleteAt: { $exists: true },
            paranoid: false,
          });
        }
      });

      return OrderSchema;
    },
  },
]);

export default OrderModel;
