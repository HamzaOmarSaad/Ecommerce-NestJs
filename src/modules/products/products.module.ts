import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import ProductModel from 'src/model/product.model';
import { BrandRepo, CategoryRepo, ProductRepo } from 'src/common/repos';
import { s3Service } from 'src/common/utils/s3.service';
import CategoryModel from 'src/model/category.model';
import BrandModel from 'src/model/brand.model';

@Module({
  imports: [ProductModel, CategoryModel, BrandModel],
  controllers: [ProductsController],
  providers: [ProductsService, ProductRepo, s3Service, BrandRepo, CategoryRepo],
})
export class ProductsModule {}
