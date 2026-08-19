import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { HUser } from 'src/common/interfaces/user.interface';
import { s3Service } from 'src/common/utils/s3.service';
import { CacheService } from 'src/common/shared/redis/caching.service';
import { ProductRepo } from 'src/common/repos';
import { CouponRepo } from 'src/common/repos/coupon.repo';
import { ICoupon } from 'src/common/interfaces/coupon.interface';

@Injectable()
export class CouponService {
  constructor(
    private readonly s3: s3Service,
    private readonly productRepository: ProductRepo,
    private readonly couponRepository: CouponRepo,
    private readonly redis: CacheService,
  ) {}
  async create(
    { name, numberOfUses, discount, startDate, endDate, type }: CreateCouponDto,
    user: HUser,
  ): Promise<ICoupon> {
    const checkDuplicate = await this.couponRepository.findOne({
      name,
      paranoid: false,
    });
    if (checkDuplicate) {
      throw new ConflictException('coupon already exist  ');
    }
    const coupon = await this.couponRepository.create({
      name,
      numberOfUses,
      discount,
      startDate,
      endDate,
      type,
      createdBy: user._id,
    });
    if (!coupon) {
      throw new BadRequestException('error happened in creating coupon');
    }
    return coupon.toJSON();
  }

  // will be in order
  async Use(couponName: string, user: HUser) {
    const coupon = await this.couponRepository.findOne({
      name: couponName,
    });
    if (coupon) {
      throw new ConflictException("coupon doesn't exist ");
    }
    //check end date
    //check if user used it before
    // if find count of his uses and compare it with duration if less than proceed
  }

  update(id: number, updateCouponDto: UpdateCouponDto) {
    return `This action updates a #${id} coupon`;
  }

  remove(id: number) {
    return `This action removes a #${id} coupon`;
  }
}
