import { RoleEnum } from './../../common/Enums/enums';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Auth, User } from 'src/common/Decorators';
import type { HUser } from 'src/common/interfaces/user.interface';
import { confirmOrderDto } from './dto/confirm-order.dto';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Auth([RoleEnum.user])
  @Post()
  async create(@Body() createOrderDto: CreateOrderDto, @User() user: HUser) {
    return await this.orderService.create(createOrderDto, user);
  }
  @Auth([RoleEnum.admin])
  @Post('/:id/confirm')
  async confirm(
    @Param() confirmOrderDto: confirmOrderDto,
    @User() user: HUser,
  ) {
    return await this.orderService.confirm(confirmOrderDto, user);
  }

  @Get()
  findAll() {
    return this.orderService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(+id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderService.remove(+id);
  }
}
