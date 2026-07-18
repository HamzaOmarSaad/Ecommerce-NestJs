import {
  cloudMulter,
  fileTypesValidation,
} from './../../common/utils/local.multer';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
} from '@nestjs/common';
import { BrandService } from './brand.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto, UpdateBrandPramsDto } from './dto/update-brand.dto';
import { Auth, User } from 'src/common/Decorators';
import { RoleEnum } from 'src/common/Enums/enums';
import { FileInterceptor } from '@nestjs/platform-express';
import type { HUser } from 'src/common/interfaces/user.interface';
import type { IFile } from 'src/common/interfaces/multer.interface';
import { IBrand } from 'src/common/interfaces/brand.interface';

@Controller('brand')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Auth([RoleEnum.admin])
  @UseInterceptors(
    FileInterceptor(
      'attachment',
      cloudMulter({ validation: fileTypesValidation.image }),
    ),
  )
  @Post('/create')
  async create(
    @Body() createBrandDto: CreateBrandDto,
    @User() user: HUser,
    @UploadedFile(ParseFilePipe) file: IFile,
  ) {
    return await this.brandService.create(user, createBrandDto.name, file);
  }

  /**------------------------------------------------------------------------------------- */
  @Auth([RoleEnum.admin])
  @UseInterceptors(
    FileInterceptor(
      'attachment',
      cloudMulter({ validation: fileTypesValidation.image }),
    ),
  )
  @Patch(':brandId')
  async update(
    @Param('brandId') params: UpdateBrandPramsDto,
    @Body() updateBrandDto: UpdateBrandDto,
    @User() user: HUser,
    @UploadedFile(new ParseFilePipe({ fileIsRequired: false })) file?: IFile,
  ): Promise<IBrand> {
    return await this.brandService.update(params, updateBrandDto, user, file);
  }
  /**------------------------------------------------------------------------------------- */

  @Get()
  findAll() {
    return this.brandService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.brandService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.brandService.remove(+id);
  }
}
