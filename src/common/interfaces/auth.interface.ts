import { JwtPayload } from 'jsonwebtoken';
import { HUser } from './user.interface';
import { Request } from 'express';

export interface IAuthRequest extends Request {
  credentials?: { user: HUser; decoded: JwtPayload };
}
