import { Module } from '@nestjs/common';
import { securityService } from './security.service';

@Module({
  imports: [],
  exports: [securityModule],
  controllers: [],
  providers: [securityService],
})
export class securityModule {}
