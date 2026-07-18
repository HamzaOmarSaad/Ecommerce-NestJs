import { Transform } from 'class-transformer';
import {
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Types } from 'mongoose';
import { IsGte } from 'src/common/Decorators';
import { IProduct } from 'src/common/interfaces/product.interface';

export class CreateProductDto implements Partial<IProduct> {
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  description!: string;

  @IsPositive()
  @Transform(({ value }) => Number(value))
  price!: number;

  @IsPositive()
  @Transform(({ value }) => Number(value))
  @IsGte(['price'])
  salePrice!: number;

  @IsPositive()
  @Transform(({ value }) => Number(value))
  @Min(0)
  @Max(100)
  @IsOptional()
  discount?: number;

  @IsPositive()
  @Transform(({ value }) => Number(value))
  stock!: number;

  @IsPositive()
  @Transform(({ value }) => Number(value))
  @Min(0)
  @Max(5)
  @IsOptional()
  rating?: number;

  @IsMongoId()
  brandId?: Types.ObjectId;
  @IsMongoId()
  categoryId?: Types.ObjectId;
}
