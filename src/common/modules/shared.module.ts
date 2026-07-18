import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { createClient } from 'redis';
import { UserRepo } from 'src/common/repos';
import { CacheService } from 'src/common/shared/redis/caching.service';
import { TokenService } from 'src/common/shared/Token/token.service';
import UserModel from 'src/model/user.model';
import { authController } from 'src/modules/authentication/auth.controller';

@Global()
@Module({
  imports: [UserModel, JwtModule.register({})],
  exports: [
    'REDIS_CLIENT',
    UserRepo,
    CacheService,
    TokenService,
    JwtService,
    JwtModule,
  ],
  controllers: [],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: async (ConfigService: ConfigService) => {
        const client = createClient({
          url: ConfigService.get<string>('REDIS_DB_URI'),
        });

        client.on('error', (err) => console.error('Redis Client Error', err));

        await client.connect();
        console.log('✅ Redis connected');

        return client;
      },
      inject: [ConfigService],
    },

    UserRepo,
    CacheService,
    TokenService,
    JwtService,
  ],
})
export class SharedAuthModule {}
