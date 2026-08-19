import { Coupon } from 'src/model/coupon.model';
import { DBRepo } from './repo';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { ICoupon } from '../interfaces/coupon.interface';

@Injectable()
export class CouponRepo extends DBRepo<ICoupon> {
  constructor(
    @InjectModel(Coupon.name) protected readonly model: Model<ICoupon>,
  ) {
    super(model);
  }
  public async findByName(name: string) {
    return await this.findOne({ name: name });
  }
}
