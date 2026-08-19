import {
  MongooseModule,
  Prop,
  raw,
  Schema,
  SchemaFactory,
} from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { CouponTypeEnum } from 'src/common/Enums/coupon.enum';
import { HCoupon, ICoupon } from 'src/common/interfaces/coupon.interface';
import { IUser } from 'src/common/interfaces/user.interface';
import { generateSlug } from 'src/common/utils/slug';

@Schema({
  timestamps: true,
  strict: true,
  strictQuery: true,
  toJSON: { virtuals: true, getters: true },
  toObject: { virtuals: true, getters: true },
})
export class Coupon implements ICoupon {
  @Prop({
    type: String,
    enum: CouponTypeEnum,
    required: true,
    default: CouponTypeEnum.PERCENTAGE,
  })
  type!: CouponTypeEnum;

  @Prop({
    type: Number,
    required: true,
    min: 0,
  })
  discount!: number;

  @Prop({
    type: [
      raw({
        userId: { type: Types.ObjectId, ref: 'Users' },
        orderId: { type: Types.ObjectId, ref: 'Order' },
        time: { type: Date, default: Date.now },
      }),
    ],
    default: [],
    required: false,
  })
  usedBy!: {
    userId: Types.ObjectId | IUser;
    orderId: Types.ObjectId;
    time: Date;
  }[];

  @Prop({
    type: Date,
    default: Date.now,
  })
  startDate!: Date;

  @Prop({
    type: Date,
    required: true,
  })
  endDate!: Date;

  @Prop({
    type: Number,
    min: 1,
    default: 1,
  })
  numberOfUses!: number;

  createdAt?: Date | undefined;
  updatedAt?: Date | undefined;

  @Prop({
    type: String,
    required: true,
    unique: true,
  })
  name!: string;

  @Prop({
    type: String,
    required: true,
  })
  slug!: string;

  @Prop({
    type: Date,
    default: false,
  })
  deletedAt?: Date | undefined;
  @Prop({
    type: Date,
    default: false,
  })
  restoredAt?: Date | undefined;

  @Prop({
    type: Types.ObjectId,
    ref: 'Users',
    required: true,
  })
  createdBy?: Types.ObjectId | IUser;
  @Prop({
    type: Types.ObjectId,
    ref: 'Users',
  })
  updatedBy?: Types.ObjectId | IUser;
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);

const CouponModel = MongooseModule.forFeatureAsync([
  {
    name: Coupon.name,
    useFactory: () => {
      CouponSchema.pre(['deleteOne', 'findOneAndDelete'], function () {
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
      CouponSchema.pre(['find', 'findOne'], function () {
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
      CouponSchema.pre(['updateOne', 'findOneAndUpdate'], function () {
        const update = this.getUpdate() as HCoupon;
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
      CouponSchema.pre('save', function (this: HCoupon & { wasNew: boolean }) {
        if (this.isModified('couponName')) {
          this.slug = generateSlug(this.name);
        }
      });
      return CouponSchema;
    },
  },
]);

export default CouponModel;
