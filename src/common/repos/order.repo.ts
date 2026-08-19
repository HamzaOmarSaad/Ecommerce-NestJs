import { Order } from 'src/model/order.model';
import { DBRepo } from './repo';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { IOrder } from '../interfaces/order.interface';

@Injectable()
export class OrderRepo extends DBRepo<IOrder> {
  constructor(
    @InjectModel(Order.name) protected readonly model: Model<IOrder>,
  ) {
    super(model);
  }
  public async findByName(name: string) {
    return await this.findOne({ name: name });
  }
}
