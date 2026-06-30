import { User } from 'src/model/userModel';
import { IUser } from '../interfaces/db.type';
import { DBRepo } from './repo';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserRepo extends DBRepo<IUser> {
  constructor(@InjectModel(User.name) protected readonly model: Model<IUser>) {
    super(model);
  }
  public async findByEmail(email: string) {
    return await this.findOne({ email: email });
  }
}
