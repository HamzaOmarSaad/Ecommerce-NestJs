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

  isEmailConfirmed?: Date;
  isDeleted?: Date;
  isRestored?: Date;
  changedCredentialsTime?: Date;

  role: RoleEnum;
  provider: providerEnum;
  gender?: GenderEnum;

  language?: languageEnum;
}
export type HUser = HydratedDocument<IUser>;
/*------------------------------------------------------------------------------------ */
