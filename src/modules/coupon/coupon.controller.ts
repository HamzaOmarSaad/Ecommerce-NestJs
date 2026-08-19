import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { User, Auth } from 'src/common/Decorators';
import type { HUser } from 'src/common/interfaces/user.interface';
import { RoleEnum } from 'src/common/Enums/enums';

@Controller('coupon')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Auth([RoleEnum.admin])
  @Post()
  create(@Body() createCouponDto: CreateCouponDto, @User() user: HUser) {
    return this.couponService.create(createCouponDto, user);
  }

  @Auth([RoleEnum.user])
  @Post(':id')
  use(@Param(':id') couponId: string, @User() user: HUser) {
    return this.couponService.Use(couponId, user);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCouponDto: UpdateCouponDto) {
    return this.couponService.update(+id, updateCouponDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.couponService.remove(+id);
  }
}
