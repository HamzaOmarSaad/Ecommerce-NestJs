import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import OrderModel from 'src/model/order.model';
import { OrderRepo } from 'src/common/repos/order.repo';
import { CartRepo, ProductRepo } from 'src/common/repos';
import ProductModel from 'src/model/product.model';
import CouponModel from 'src/model/coupon.model';
import CartModel from 'src/model/cart.model';
import { CouponRepo } from 'src/common/repos/coupon.repo';
import { CartService } from '../cart/cart.service';

@Module({
  imports: [OrderModel, ProductModel, CouponModel, CartModel],
  controllers: [OrderController],
  providers: [
    OrderService,
    OrderRepo,
    ProductRepo,
    CartRepo,
    CouponRepo,
    CartService,
  ],
})
export class OrderModule {}
