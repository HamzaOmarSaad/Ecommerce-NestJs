import { Module } from '@nestjs/common';
import { securityService } from './security.service';

@Module({
  imports: [],
  exports: [securityService],
  controllers: [],
  providers: [securityService],
})
export class securityModule {}
