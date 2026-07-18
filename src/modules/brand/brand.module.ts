import { Module } from '@nestjs/common';
import { BrandService } from './brand.service';
import { BrandController } from './brand.controller';
import BrandModel from 'src/model/brand.model';
import { s3Service } from 'src/common/utils/s3.service';
import { BrandRepo } from 'src/common/repos';

@Module({
  imports: [BrandModel],
  controllers: [BrandController],
  providers: [BrandService, s3Service, BrandRepo],
})
export class BrandModule {}
