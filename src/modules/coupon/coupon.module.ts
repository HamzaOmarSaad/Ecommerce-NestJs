import { Module } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CouponController } from './coupon.controller';
import CouponModel from 'src/model/coupon.model';
import { CouponRepo } from 'src/common/repos/coupon.repo';
import { s3Service } from 'src/common/utils/s3.service';

@Module({
  imports: [CouponModel],
  controllers: [CouponController],
  providers: [CouponService, CouponRepo, s3Service],
})
export class CouponModule {}
