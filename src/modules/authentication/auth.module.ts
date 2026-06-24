import { Module } from '@nestjs/common';
import { authController } from './auth.controller';
import { authService } from './auth.service';

@Module({
  imports: [],
  exports: [authService],
  controllers: [authController],
  providers: [authService],
})
export class authModule {}
