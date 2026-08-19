import { SetMetadata } from '@nestjs/common';

export const ttl = (ttl: number = 10) => SetMetadata('TTL', ttl);
export const personalCache = (personalCache: boolean = false) =>
  SetMetadata('personalCache', ttl);
