import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { Auth, User } from 'src/common/Decorators';
import { tokenTypeEnum } from 'src/common/interfaces/token.types';
import { RoleEnum } from 'src/common/Enums/enums';
import type { HUser } from 'src/common/interfaces/db.type';

@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Auth([RoleEnum.user], tokenTypeEnum.access)
  @Get()
  profile(@User() user: HUser) {
    return { message: 'done', data: { user } };
  }
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
