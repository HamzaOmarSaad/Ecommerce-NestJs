import { Product } from 'src/model/product.model';
import { DBRepo } from './repo';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { IProduct } from '../interfaces/product.interface';

@Injectable()
export class ProductRepo extends DBRepo<IProduct> {
  constructor(
    @InjectModel(Product.name) protected readonly model: Model<IProduct>,
  ) {
    super(model);
  }
  public async findByProductId(id: string) {
    return await this.findOne({ productId: id });
  }
}
