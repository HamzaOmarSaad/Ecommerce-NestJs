import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { ArrayUnique, IsArray, IsMongoId, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @ArrayUnique()
  @IsArray()
  @IsString({ each: true })
  removeFromGallery?: string[];
}

export class UpdateProductPramsDto {
  @IsMongoId()
  productId!: string | Types.ObjectId;
}
