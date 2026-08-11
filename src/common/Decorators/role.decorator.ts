import { SetMetadata } from '@nestjs/common';
import { RoleEnum } from '../Enums/enums';

// injecting role so i can get it in the guard

export const Role = (role: RoleEnum[]) => SetMetadata('roleName', role);
