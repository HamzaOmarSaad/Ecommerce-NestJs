import { Cart } from 'src/model/cart.model';
import { DBRepo } from './repo';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { ICart } from '../interfaces/cart.interface';

@Injectable()
export class CartRepo extends DBRepo<ICart> {
  constructor(@InjectModel(Cart.name) protected readonly model: Model<ICart>) {
    super(model);
  }
  public async findByName(name: string) {
    return await this.findOne({ name: name });
  }
}
