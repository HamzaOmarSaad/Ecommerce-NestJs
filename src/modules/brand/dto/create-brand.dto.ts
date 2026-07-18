import { IBrand } from 'src/common/interfaces/brand.interface';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateBrandDto implements Partial<IBrand> {
  @IsString()
  @MaxLength(55)
  @MinLength(2)
  @IsNotEmpty()
  name!: string;
}
