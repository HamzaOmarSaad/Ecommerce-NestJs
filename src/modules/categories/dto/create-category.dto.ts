import {
  ArrayUnique,
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Types } from 'mongoose';
import { IBrand } from 'src/common/interfaces/brand.interface';
import { ICategory } from 'src/common/interfaces/category.interface';

export class CreateCategoryDto implements Partial<ICategory> {
  @IsString()
  @MaxLength(55)
  @MinLength(2)
  @IsNotEmpty()
  name!: string;

  @IsMongoId({ each: true })
  @IsArray()
  @ArrayUnique()
  @IsOptional()
  brandIds?: Types.ObjectId[] | IBrand[] | undefined;
}
