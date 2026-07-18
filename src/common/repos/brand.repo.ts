import { Brand } from 'src/model/brand.model';
import { DBRepo } from './repo';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { IBrand } from '../interfaces/brand.interface';

@Injectable()
export class BrandRepo extends DBRepo<IBrand> {
  constructor(
    @InjectModel(Brand.name) protected readonly model: Model<IBrand>,
  ) {
    super(model);
  }
  public async findByName(name: string) {
    return await this.findOne({ name: name });
  }
}
