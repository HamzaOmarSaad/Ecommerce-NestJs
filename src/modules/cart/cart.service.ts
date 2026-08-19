import { Injectable, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { CreateCartDto } from './dto/create-cart.dto';
import { removeItemFromCartDto, UpdateCartDto } from './dto/update-cart.dto';
import { HUser } from 'src/common/interfaces/user.interface';
import { s3Service } from 'src/common/utils/s3.service';
import { CartRepo, ProductRepo } from 'src/common/repos';
import { toObjectId } from 'src/common/utils/mongoose.utils';
import { ICart } from 'src/common/interfaces/cart.interface';
import { CacheService } from 'src/common/shared/redis/caching.service';

@Injectable()
export class CartService {
  constructor(
    private readonly s3: s3Service,
    private readonly productRepository: ProductRepo,
    private readonly cartRepository: CartRepo,
    private readonly redis: CacheService,
  ) {}
  async createAndAdd(
    { productId, quantity }: CreateCartDto,
    user: HUser,
  ): Promise<ICart> {
    productId = toObjectId(productId as unknown as string);
    const product = await this.productRepository.findOne({
      _id: productId,
      stock: { $gte: quantity },
    });
    if (!product) {
      throw new NotFoundException('product not found or stock is low ');
    }
    let cart = await this.cartRepository.findOne({ createdBy: user._id });
    // no cart for that user
    if (!cart) {
      cart = await this.cartRepository.create({
        createdBy: user._id,
        products: [{ productId, quantity: quantity > 0 ? quantity : 1 }],
      });
      return cart.toJSON();
    }
    let match = false;
    // if there is a cart
    for (const item of cart.products) {
      if (
        (item.productId as Types.ObjectId).toString() == productId.toString()
      ) {
        // if product us in the cart inc quantity
        match = true;
        item.quantity += quantity;
        item.quantity = item.quantity > 0 ? item.quantity : 1;
        if (product.stock < item.quantity) {
          throw new NotFoundException('stock is low ');
        }
      }
    }
    if (!match) {
      // add product ot the cart if not in it
      cart.products.push({ productId, quantity: quantity > 0 ? quantity : 1 });
    }

    await cart.save();
    await this.redis.clearCache('/cart', user._id.toString());
    return cart.toJSON();
  }

  async findOne(user: HUser): Promise<ICart> {
    const cart = await this.cartRepository.findOne(
      {
        createdBy: user._id,
      },
      {},
      {
        populate: [{ path: 'products.productId' }],
      },
    );
    if (!cart) {
      throw new NotFoundException('cart is empty ');
    }

    return cart.toJSON();
  }

  async removeProducts(
    user: HUser,
    { productIds }: removeItemFromCartDto,
  ): Promise<ICart> {
    productIds = productIds.map((ele) => toObjectId(ele as unknown as string));
    const cart = await this.cartRepository.findOneAndUpdate(
      {
        createdBy: user._id,
      },
      {
        $pull: { products: { productId: { $in: productIds } } },
      },
    );
    if (!cart) {
      throw new NotFoundException('cart is not found ');
    }
    await this.redis.clearCache('/cart', user._id.toString());
    return cart?.toJSON();
  }

  async empty(user: HUser): Promise<ICart> {
    const cart = await this.cartRepository.findOneAndDelete({
      createdBy: user._id,
    });
    if (!cart) {
      throw new NotFoundException('cart is empty ');
    }
    await this.redis.clearCache('/cart', user._id.toString());
    return cart?.toJSON();
  }
}
