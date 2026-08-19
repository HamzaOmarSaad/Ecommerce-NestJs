import { ProductsService } from './products.service';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { IProduct } from 'src/common/interfaces/product.interface';
import { IPaginate } from 'src/common/interfaces/paginate.interface';
import { AllProductsPaginatedResponse } from './entities/product.entity';
import { AllProductPaginatedDto } from './dto/create-product.dto';
import { UseInterceptors } from '@nestjs/common';
import { customCacheInterceptor } from 'src/common/interceptor';

@Resolver()
export class ProductResolver {
  constructor(private productsService: ProductsService) {}

  @UseInterceptors(customCacheInterceptor)
  @Query(() => AllProductsPaginatedResponse, {
    description: 'get all products',
    name: 'AllProducts',
  })
  async getAllProducts(
    @Args({ nullable: false }) args: AllProductPaginatedDto,
  ): Promise<IPaginate<IProduct>> {
    const res = await this.productsService.findAll(args);
    return res;
  }
}

/**
 * guide 
 *   @Query(() => sayHiResponse, {
    description: 'firstApi',
    name: 'welcome',
    nullable: false,
  })
  @Auth([RoleEnum.user])
  sayHi(
    // @Args('data', { type: () => SayHiDto, nullable: false }) data: SayHiDto,
    @Args({ type: () => SayHiDto, nullable: false }) data: SayHiDto,
    @User() user: HUser,
  ): {
    message: string;
    age?: number;
  } {
    return { message: ` hello ${data.name}`, age: data.age || 0 };
  }
  @Mutation(() => [sayHiResponse], {
    description: 'firstApi',
    name: 'welcome',
    nullable: false,
  })
  doHi(): { message: string; age?: number }[] {
    return [{ message: 'hello', age: 234 }];
  }
 * 
 */
