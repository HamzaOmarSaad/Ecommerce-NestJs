import { Category } from 'src/model/category.model';
import { DBRepo } from './repo';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { ICategory } from '../interfaces/category.interface';

@Injectable()
export class CategoryRepo extends DBRepo<ICategory> {
  constructor(
    @InjectModel(Category.name) protected readonly model: Model<ICategory>,
  ) {
    super(model);
  }
  public async findByName(name: string) {
    return await this.findOne({ name: name });
  }
}
