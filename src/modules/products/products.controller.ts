import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
// import { UpdateProductDto } from './dto/update-product.dto';
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
  ParseFilePipe,
  UploadedFiles,
} from '@nestjs/common';
import { Auth, User } from 'src/common/Decorators';
import { RoleEnum } from 'src/common/Enums/enums';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import type { HUser } from 'src/common/interfaces/user.interface';
import type { IFile } from 'src/common/interfaces/multer.interface';
import {
  UpdateProductDto,
  UpdateProductPramsDto,
} from './dto/update-product.dto';
import { IProduct } from 'src/common/interfaces/product.interface';
// import { ICategory } from 'src/common/interfaces/category.interface';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Auth([RoleEnum.admin])
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'productImage', maxCount: 1 },
        { name: 'gallery', maxCount: 3 },
      ],
      cloudMulter({ validation: fileTypesValidation.image }),
    ),
  )
  @Post('/create')
  async create(
    @Body() createProductDto: CreateProductDto,
    @User() user: HUser,
    @UploadedFiles(ParseFilePipe)
    files: { productImage: IFile; gallery?: IFile[] },
  ) {
    return await this.productsService.create(createProductDto, user, files);
  }

  @Auth([RoleEnum.admin])
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'productImage', maxCount: 1 },
        { name: 'gallery', maxCount: 3 },
      ],
      cloudMulter({ validation: fileTypesValidation.image }),
    ),
  )
  @Patch(':ProductId')
  async update(
    @Param('ProductId') params: UpdateProductPramsDto,
    @Body() updateCategoryDto: UpdateProductDto,
    @User() user: HUser,
    @UploadedFiles(ParseFilePipe)
    files: { productImage?: IFile; gallery?: IFile[] },
  ): Promise<IProduct> {
    return await this.productsService.update(
      params,
      updateCategoryDto,
      user,
      files,
    );
  }
  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}
