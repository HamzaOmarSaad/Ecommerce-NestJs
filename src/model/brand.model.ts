import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { HBrand, IBrand } from 'src/common/interfaces/brand.interface';
import { IUser } from 'src/common/interfaces/user.interface';
import { generateSlug } from 'src/common/utils/slug';

@Schema({
  timestamps: true,
  strict: true,
  strictQuery: true,
  toJSON: { virtuals: true, getters: true },
  toObject: { virtuals: true, getters: true },
})
export class Brand implements IBrand {
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
    type: String,
  })
  image?: string;

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

export const BrandSchema = SchemaFactory.createForClass(Brand);

const BrandModel = MongooseModule.forFeatureAsync([
  {
    name: Brand.name,
    useFactory: () => {
      BrandSchema.pre(['deleteOne', 'findOneAndDelete'], function () {
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
      BrandSchema.pre(['find', 'findOne'], function () {
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
      BrandSchema.pre(['updateOne', 'findOneAndUpdate'], function () {
        const update = this.getUpdate() as HBrand;
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
      BrandSchema.pre('save', function (this: HBrand & { wasNew: boolean }) {
        if (this.isModified('brandName')) {
          this.slug = generateSlug(this.name);
        }
      });
      return BrandSchema;
    },
  },
]);

export default BrandModel;
