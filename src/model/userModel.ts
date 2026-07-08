import { securityService } from './../common/shared/security/security.service';
import {
  MongooseModule,
  Prop,
  Schema,
  SchemaFactory,
  Virtual,
} from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { GenderEnum, providerEnum, RoleEnum } from 'src/common/Enums/enums';
import { HUser, IUser } from 'src/common/interfaces/db.type';
import { BadRequestException } from '@nestjs/common';
import { securityModule } from 'src/common/shared/security/security.module';

@Schema({
  timestamps: true,
  strict: true,
  strictQuery: true,
  toJSON: { virtuals: true, getters: true },
  toObject: { virtuals: true, getters: true },
})
export class User implements IUser {
  @Prop({
    type: String,
    required: true,
  })
  firstName!: string;

  @Prop({
    type: String,
    required: true,
  })
  lastName!: string;
  @Virtual({
    set: function (this: HUser, value: string) {
      const [firstName, lastName] = value.split(' ') || [];
      this.firstName = firstName;
      this.lastName = lastName;
    },
    get: function (this: HUser) {
      return `${this.firstName} ${this.lastName} `;
    },
  })
  fullName!: string;
  @Prop({
    type: String,
    required: true,
    unique: true,
  })
  email!: string;

  @Prop({
    type: String,
    required: function (this: any) {
      return this.provider === providerEnum.system;
    },
  })
  password?: string;

  @Prop({
    type: String,
  })
  phone?: string;

  @Prop({
    type: String,
    default: providerEnum.system,
    enum: [providerEnum.system, providerEnum.google],
  })
  provider!: providerEnum;

  @Prop({
    type: Number,
    default: GenderEnum.male,
    enum: [GenderEnum.male, GenderEnum.female],
  })
  gender?: number;

  @Prop({
    type: Number,
    default: RoleEnum.user,
    enum: [RoleEnum.user, RoleEnum.admin],
  })
  role!: RoleEnum;
  @Prop({
    type: String,
  })
  profilePicture?: string;

  @Prop({
    type: Date,
  })
  isEmailConfirmed?: Date | undefined;

  @Prop({
    type: Date,
    default: false,
  })
  deletedAt?: Date | undefined;
  @Prop({
    type: Date,
    default: false,
  })
  changedCredentialsTime?: Date | undefined;
}

export const UserSchema = SchemaFactory.createForClass(User);

//no hooks
// const UserModel = MongooseModule.forFeature([
//   {
//     name: User.name,
//     schema: UserSchema,
//   },
// ]);
const UserModel = MongooseModule.forFeatureAsync([
  {
    name: User.name,
    imports: [securityModule],
    useFactory: (securityService: securityService) => {
      UserSchema.pre('save', async function (this: mongoose.Document & IUser) {
        if (this.isModified?.('password')) {
          this.set(
            'password',
            await securityService.hashService(this.get('password') as string),
          );
        }
        if (this.isModified?.('phone')) {
          this.set(
            'phone',
            securityService.encryptService(this.get('phone') as string),
          );
        }
      });
      UserSchema.pre('validate', function (this: mongoose.Document & IUser) {
        if (this.password && this.provider === providerEnum.google) {
          throw new BadRequestException('google acc cannot have a password');
        }
      });

      //   UserSchema.post(
      //     ['findOne', 'find'],
      //     function (doc: (mongoose.Document & IUser) | null, next: NextFunction) {
      //       if (doc) {
      //         (doc as any).phone = securityService.decryptService(
      //           doc.phone as string,
      //         );
      //       }
      //       next();
      //     },
      //   );
      UserSchema.pre(
        ['findOneAndUpdate', 'updateOne'],
        async function (this: mongoose.Query<any, IUser>) {
          const update: mongoose.UpdateQuery<IUser> | null = this.getUpdate();
          if (update?.password) {
            update.password = await securityService.hashService(
              update.password as string,
            );
          }
        },
      );
      UserSchema.pre(['deleteOne', 'findOneAndDelete'], function () {
        if (this.getQuery().force == true) {
          this.setQuery({
            ...this.getQuery(),
          });
        } else {
          this.setQuery({
            ...this.getQuery(),
            deleteAt: { $exists: true },
          });
        }
      });
      return UserSchema;
    },
    inject: [securityService],
  },
]);

export default UserModel;
