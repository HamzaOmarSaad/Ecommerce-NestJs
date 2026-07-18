import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';

import { ArrayUnique, IsArray, IsMongoId, IsOptional } from 'class-validator';
import { Types } from 'mongoose';
import { IBrand } from 'src/common/interfaces/brand.interface';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  @IsMongoId({ each: true })
  @IsArray()
  @ArrayUnique()
  @IsOptional()
  removedBrandIds?: IBrand[] | Types.ObjectId[];
  @IsMongoId({ each: true })
  @IsArray()
  @ArrayUnique()
  @IsOptional()
  addedBrandIds?: IBrand[] | Types.ObjectId[];
}
export class UpdateCategoryPramsDto {
  @IsMongoId()
  categoryId!: string | Types.ObjectId;
}
