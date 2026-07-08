import { SetMetadata } from '@nestjs/common';
import { RoleEnum } from '../Enums/enums';
export const Role = (role: RoleEnum[]) => SetMetadata('roleName', role);
