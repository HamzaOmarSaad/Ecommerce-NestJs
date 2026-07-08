import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuthenticationMiddleware } from 'src/common/middleware/auth.middleware';

@Module({
  imports: [],
  exports: [],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthenticationMiddleware).forRoutes({
      path: '/users',
      method: RequestMethod.ALL,
    });
  }
}
