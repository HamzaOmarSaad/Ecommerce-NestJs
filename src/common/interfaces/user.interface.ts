import { HydratedDocument } from 'mongoose';
import {
  GenderEnum,
  languageEnum,
  providerEnum,
  RoleEnum,
} from '../Enums/enums';

export interface IUser {
  firstName: string;
  lastName: string;
  userName?: string;
  email: string;
  password?: string;
  phone?: string;

  profilePicture?: string;
  profileCoverPicture?: string[];

  emailConfirmedAt?: Date;
  deletedAt?: Date;
  restoredAt?: Date;
  changedCredentialsTime?: Date;

  role: RoleEnum;
  provider: providerEnum;
  gender?: GenderEnum;

  language?: languageEnum;
}
export type HUser = HydratedDocument<IUser>;
/*------------------------------------------------------------------------------------ */
