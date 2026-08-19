import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import CartModel from 'src/model/cart.model';
import ProductModel from 'src/model/product.model';
import { CartRepo, ProductRepo } from 'src/common/repos';

@Module({
  imports: [CartModel, ProductModel],
  controllers: [CartController],
  providers: [CartService, CartRepo, ProductRepo],
})
export class CartModule {}
