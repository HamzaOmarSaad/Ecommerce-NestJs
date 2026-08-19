import {
  MongooseModule,
  Prop,
  raw,
  Schema,
  SchemaFactory,
} from '@nestjs/mongoose';
import { Types } from 'mongoose';
import {
  HCart,
  ICart,
  ICartProduct,
} from 'src/common/interfaces/cart.interface';
import { IUser } from 'src/common/interfaces/user.interface';
import { generateSlug } from 'src/common/utils/slug';

@Schema({
  timestamps: true,
  strict: true,
  strictQuery: true,
  toJSON: { virtuals: true, getters: true },
  toObject: { virtuals: true, getters: true },
})
export class Cart implements ICart {
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
    }),
  ])
  products!: ICartProduct[];

  @Prop({
    type: Types.ObjectId,
    ref: 'Users',
    required: true,
  })
  createdBy!: Types.ObjectId | IUser;
}

export const CartSchema = SchemaFactory.createForClass(Cart);

const CartModel = MongooseModule.forFeature([
  { name: Cart.name, schema: CartSchema },
]);

export default CartModel;
