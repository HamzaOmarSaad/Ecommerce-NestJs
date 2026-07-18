import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { IBrand } from 'src/common/interfaces/brand.interface';
import { ICategory } from 'src/common/interfaces/category.interface';
import { IProduct, HProduct } from 'src/common/interfaces/product.interface';
import { IUser } from 'src/common/interfaces/user.interface';
import { generateSlug } from 'src/common/utils/slug';

@Schema({
  timestamps: true,
  strict: true,
  strictQuery: true,
  toJSON: { virtuals: true, getters: true },
  toObject: { virtuals: true, getters: true },
})
export class Product implements IProduct {
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
  description!: string;
  @Prop({
    type: String,
    required: true,
  })
  productId!: string;

  @Prop({
    type: Number,
    required: true,
    min: 0,
  })
  price!: number;
  @Prop({
    type: Number,
    min: 0,
  })
  salePrice?: number;
  @Prop({
    type: Number,
    required: true,
    min: 0,
  })
  discount?: number;
  @Prop({
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  })
  finalPrice!: number;

  @Prop({
    type: Number,
    required: true,
    min: 0,
  })
  stock!: number;
  @Prop({
    type: Number,
    required: true,
    min: 0,
    max: 5,
  })
  rating?: number | undefined;

  @Prop({
    type: String,
    required: true,
  })
  slug!: string;

  @Prop({
    type: String,
  })
  image?: string;
  @Prop([
    {
      type: String,
    },
  ])
  gallery?: string[] | undefined;

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
  createdBy?: Types.ObjectId | IUser | undefined;
  @Prop({
    type: Types.ObjectId,
    ref: 'Users',
  })
  updatedBy?: Types.ObjectId | IUser | undefined;
  @Prop([
    {
      type: Types.ObjectId,
      ref: 'Brand',
    },
  ])
  brandId?: Types.ObjectId | IBrand;
  @Prop([
    {
      type: Types.ObjectId,
      ref: 'Categories',
    },
  ])
  categoryId?: Types.ObjectId | ICategory;
  @Prop([
    {
      type: Types.ObjectId,
      ref: 'Users',
    },
  ])
  interestedUsers?: Types.ObjectId[] | IUser[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);

const ProductModel = MongooseModule.forFeatureAsync([
  {
    name: Product.name,
    useFactory: () => {
      ProductSchema.pre(['deleteOne', 'findOneAndDelete'], function () {
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
      ProductSchema.pre(['find', 'findOne'], function () {
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
      ProductSchema.pre(['updateOne', 'findOneAndUpdate'], function () {
        const update = this.getUpdate() as HProduct;
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
      ProductSchema.pre(
        'save',
        function (this: HProduct & { wasNew: boolean }) {
          if (this.isModified('productName')) {
            this.slug = generateSlug(this.name);
          }
        },
      );
      return ProductSchema;
    },
  },
]);

export default ProductModel;
