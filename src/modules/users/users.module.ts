import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { AuthenticationMiddleware } from 'src/common/middleware/auth.middleware';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { s3Service } from 'src/common/utils/s3.service';

@Module({
  imports: [MulterModule.register()],
  exports: [],
  controllers: [UsersController],
  providers: [UsersService, s3Service],
})
export class UsersModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthenticationMiddleware).forRoutes({
      path: '/users',
      method: RequestMethod.ALL,
    });
  }
}
