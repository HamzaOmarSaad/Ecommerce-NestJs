import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { removeItemFromCartDto, UpdateCartDto } from './dto/update-cart.dto';
import { customCacheInterceptor } from 'src/common/interceptor';
import { AuthenticationGuard } from 'src/common/guards/authentication.guard';
import { Auth, personalCache, ttl, User } from 'src/common/Decorators';
import type { HUser } from 'src/common/interfaces/user.interface';
import { RoleEnum } from 'src/common/Enums/enums';

@UseGuards(AuthenticationGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  async create(@Body() createCartDto: CreateCartDto, @User() user: HUser) {
    return await this.cartService.createAndAdd(createCartDto, user);
  }

  @personalCache(true)
  @ttl(60)
  @UseInterceptors(customCacheInterceptor)
  @Get()
  findOne(@User() user: HUser) {
    return this.cartService.findOne(user);
  }

  @Patch('remove-items')
  async update(
    @User() user: HUser,
    @Body() removeItemFromCart: removeItemFromCartDto,
  ) {
    return await this.cartService.removeProducts(user, removeItemFromCart);
  }

  @Delete()
  async empty(@User() user: HUser) {
    return await this.cartService.empty(user);
  }
}
