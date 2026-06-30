import { HydratedDocument } from 'mongoose';
import { GenderEnum, providerEnum, RoleEnum } from '../Enums/enums';

export interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  phone?: string;
  isEmailConfirmed?: Date;
  isDeleted?: boolean;
  role: RoleEnum;
  provider: providerEnum;
  gender?: GenderEnum;
  changedCredentialsTime?: Date;
  profilePicture?: string;
  profileCoverPicture?: string[];
}
export type HUser = HydratedDocument<IUser>;
/*------------------------------------------------------------------------------------ */
