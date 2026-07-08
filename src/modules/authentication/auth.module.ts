import { MiddlewareConsumer, Module } from '@nestjs/common';
import { defaultLang } from 'src/common/middleware';
import { EmailService } from 'src/common/shared/email/email.service';
import { securityService } from 'src/common/shared/security/security.service';
import { authController } from './auth.controller';
import { authService } from './auth.service';

@Module({
  imports: [],
  exports: [],
  controllers: [authController],
  providers: [authService, EmailService, securityService],
})
export class authModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(defaultLang).forRoutes(authController);
  }
}
