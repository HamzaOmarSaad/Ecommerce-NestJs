import { User } from 'src/model/user.model';
import { IUser } from '../interfaces/user.interface';
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
