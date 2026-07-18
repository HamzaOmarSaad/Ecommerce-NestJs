import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { IBrand } from 'src/common/interfaces/brand.interface';
import { ICategory, HCategory } from 'src/common/interfaces/category.interface';
import { IUser } from 'src/common/interfaces/user.interface';
import { generateSlug } from 'src/common/utils/slug';

@Schema({
  timestamps: true,
  strict: true,
  strictQuery: true,
  toJSON: { virtuals: true, getters: true },
  toObject: { virtuals: true, getters: true },
  collection: 'Categories',
})
export class Category implements ICategory {
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
  brandIds?: Types.ObjectId[] | IBrand[] | undefined;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

const CategoryModel = MongooseModule.forFeatureAsync([
  {
    name: Category.name,
    useFactory: () => {
      CategorySchema.pre(['deleteOne', 'findOneAndDelete'], function () {
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
      CategorySchema.pre(['find', 'findOne'], function () {
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
      CategorySchema.pre(['updateOne', 'findOneAndUpdate'], function () {
        const update = this.getUpdate() as HCategory;
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
      CategorySchema.pre(
        'save',
        function (this: HCategory & { wasNew: boolean }) {
          if (this.isModified('categoryName')) {
            this.slug = generateSlug(this.name);
          }
        },
      );
      return CategorySchema;
    },
  },
]);

export default CategoryModel;
