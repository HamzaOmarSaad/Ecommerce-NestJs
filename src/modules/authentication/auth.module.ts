import { Module } from '@nestjs/common';
import { authController } from './auth.controller';
import { authService } from './auth.service';
import UserModel from 'src/model/userModel';
import { UserRepo } from 'src/common/repos';

@Module({
  imports: [UserModel],
  exports: [authService],
  controllers: [authController],
  providers: [authService, UserRepo],
})
export class authModule {}
