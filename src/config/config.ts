import { env } from 'node:process';

export const APPLICATION_NAME = env['APPLICATION_NAME'] as string;

export const PORT = env['PORT'] as unknown as number;

export const DB_URI = env['DB_URI'] as string;
export const ENCRYPTION_KEY = env['ENCRYPTION_KEY'] as string;

export const SYSTEM_JWT_SECRET = env['SYSTEM_JWT_SECRET'] as string;
export const SYSTEM_JWT_REFRESH_SECRET = env[
  'SYSTEM_JWT_REFRESH_SECRET'
] as string;
export const USER_JWT_SECRET = env['USER_JWT_SECRET'] as string;
export const USER_JWT_REFRESH_SECRET = env['USER_JWT_REFRESH_SECRET'] as string;

export const ACCESS_EXPIRES_IN = env['ACCESS_EXPIRES_IN'] as unknown as number;
export const REFRESH_EXPIRES_IN = env[
  'REFRESH_EXPIRES_IN'
] as unknown as number;

export const REDIS_DB_URI = env['REDIS_DB_URI'] as unknown as string;
export const REDIS_DB_NAME = env['REDIS_DB_NAME'] as unknown as number;

export const CLIENT_ID = env['CLIENT_ID'] as unknown as string;

export const REGION = env['REGION'] as unknown as string;
export const BUCKET_NAME = env['BUCKET_NAME'] as unknown as string;
export const AWS_ACCESS_KEY_ID = env['AWS_ACCESS_KEY_ID'] as unknown as string;
export const AWS_SECRET_ACCESS_KEY = env[
  'AWS_SECRET_ACCESS_KEY'
] as unknown as string;
export const AWS_EXPIRES_IN = env['AWS_EXPIRES_IN'] as unknown as number;
