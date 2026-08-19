import { Coupon } from 'src/model/coupon.model';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { HUser } from 'src/common/interfaces/user.interface';
import { s3Service } from 'src/common/utils/s3.service';
import { CartRepo, OrderRepo, ProductRepo } from 'src/common/repos';
import { CacheService } from 'src/common/shared/redis/caching.service';
import { CouponRepo } from 'src/common/repos/coupon.repo';
import { Types } from 'mongoose';
import { IOrderProduct } from 'src/common/interfaces/order.interface';
import { HCoupon, ICoupon } from 'src/common/interfaces/coupon.interface';
import { CouponTypeEnum } from 'src/common/Enums/coupon.enum';
import { randomUUID } from 'crypto';
import { CartService } from '../cart/cart.service';
import { confirmOrderDto } from './dto/confirm-order.dto';
import { toObjectId } from 'src/common/utils/mongoose.utils';
import { orderStatusEnum } from 'src/common/Enums/order.enum';

@Injectable()
export class OrderService {
  constructor(
    private readonly s3: s3Service,
    private readonly productRepository: ProductRepo,
    private readonly cartRepository: CartRepo,
    private readonly cartService: CartService,
    private readonly orderRepository: OrderRepo,
    private readonly couponRepository: CouponRepo,
    private readonly redis: CacheService,
  ) {}
  async create(
    { currency, paymentType, phone, address, couponName, note }: CreateOrderDto,
    user: HUser,
  ) {
    const cart = await this.cartRepository.findOne({ createdBy: user._id });
    if (!cart?.products.length) {
      throw new NotFoundException('no product in the cart ');
    }
    let coupon!: HCoupon;
    if (couponName) {
      coupon = (await this.couponRepository.findOne({
        name: couponName,
        startDate: { $lt: new Date(Date.now()) },
        endDate: { $gt: new Date(Date.now()) },
      })) as HCoupon;
      if (!coupon) {
        throw new BadRequestException('invalid coupon');
      }
      const trails = coupon.usedBy.filter(
        (ele) =>
          (ele.userId as Types.ObjectId).toString() == user._id.toString(),
      ).length;
      if (trails >= coupon.numberOfUses) {
        throw new BadRequestException('cannot reuse this coupon');
      }
    }
    const OrderProducts: IOrderProduct[] = [];
    let totalOrder: number = 0;
    for (const product of cart.products) {
      const matchProduct = await this.productRepository.findOne({
        _id: product.productId,
        stock: { $gte: product.quantity },
      });
      if (!matchProduct) {
        throw new NotFoundException(
          'product is out of stock or has been removed ',
        );
      }
      const sum = product.quantity * matchProduct.finalPrice;
      OrderProducts.push({
        productId: product.productId,
        quantity: product.quantity,
        unitAmount: matchProduct.finalPrice,
        total: sum,
      });
      totalOrder += sum;
    }
    let subtotal = totalOrder;
    let discountPercentage: number = 0;
    if (coupon) {
      discountPercentage =
        coupon.type == CouponTypeEnum.PERCENTAGE
          ? coupon.discount
          : Number((coupon.discount / totalOrder).toFixed(2)) * 100;
      subtotal -= subtotal * Number((discountPercentage / 100).toFixed(2));
    }
    const order = await this.orderRepository.create({
      currency,
      paymentType,
      phone,
      address,
      note,
      total: totalOrder,
      subtotal,
      discountPercent: discountPercentage,
      orderId: randomUUID().slice(0, 6),
      products: OrderProducts,
      createdBy: user._id,
      ...(coupon ? { couponId: coupon._id } : {}),
    });
    if (!order) {
      throw new BadRequestException('order cannot be placed ');
    }
    const stockProducts: { productId: Types.ObjectId; stock: number }[] = [];
    for (const product of cart.products) {
      const matchProduct = await this.productRepository.findOneAndUpdate(
        {
          _id: product.productId,
        },
        {
          $inc: { stock: -product.quantity },
        },
      );
      stockProducts.push({
        productId: product.productId as Types.ObjectId,
        stock: matchProduct?.stock as number,
      });
    }
    if (coupon) {
      coupon.usedBy.push({
        userId: user._id,
        orderId: order._id,
        time: new Date(Date.now()),
      });
      await coupon.save();
    }
    await this.cartService.empty(user);
    return order.toJSON();
  }

  async confirm({ orderId }: confirmOrderDto, user: HUser) {
    const order = await this.orderRepository.findOneAndUpdate(
      {
        _id: toObjectId(orderId as unknown as string),
        status: orderStatusEnum.PENDING,
      },
      { status: orderStatusEnum.PLACED, updatedby: user._id },
    );
    if (!order) {
      throw new NotFoundException('cannot find this order');
    }
    return order.toJSON();
  }

  findAll() {
    return `This action returns all order`;
  }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
