import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import CategoryModel from 'src/model/category.model';
import BrandModel from 'src/model/brand.model';
import { BrandRepo, CategoryRepo } from 'src/common/repos';
import { s3Service } from 'src/common/utils/s3.service';

@Module({
  imports: [CategoryModel, BrandModel],
  controllers: [CategoriesController],
  providers: [CategoriesService, CategoryRepo, BrandRepo, s3Service],
})
export class CategoriesModule {}
