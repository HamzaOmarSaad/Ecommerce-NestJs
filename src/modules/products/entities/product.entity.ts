import { ArgsType, Field, Float, ID, Int, ObjectType } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Types } from 'mongoose';
import { IBrand } from 'src/common/interfaces/brand.interface';
import { ICategory } from 'src/common/interfaces/category.interface';
import { IProduct } from 'src/common/interfaces/product.interface';
import type { IUser } from 'src/common/interfaces/user.interface';
import { OneUserResponse } from 'src/modules/users/entities/user.entity';

export class Product {}

@ObjectType()
export class sayHiResponse {
  @Field(() => String, { nullable: false })
  message!: string;
  @Field(() => Number, { nullable: true })
  age?: number;
}
@ObjectType()
export class OneProductResponse implements Partial<IProduct> {
  @Field(() => ID)
  _id!: Types.ObjectId;

  @Field(() => String)
  productId?: string | undefined;
  @Field(() => String)
  name!: string;
  @Field(() => String)
  description!: string;

  @Field(() => Float)
  price!: number;
  @Field(() => Float)
  salePrice!: number;
  @Field(() => Float)
  discount!: number;
  @Field(() => Float)
  finalPrice!: number;

  @Field(() => Int)
  stock!: number;
  @Field(() => Int, { nullable: true })
  @IsOptional()
  rating?: number;

  @Field(() => String)
  image?: string;
  @Field(() => [String], { nullable: true })
  gallery?: string[];

  @Field(() => OneUserResponse)
  createdBy!: IUser;
  @Field(() => OneUserResponse, { nullable: true })
  @IsOptional()
  updatedBy?: IUser;

  @Field(() => ID)
  brandId!: Types.ObjectId | IBrand;
  @Field(() => ID)
  categoryId!: Types.ObjectId | ICategory;

  @Field(() => [ID], { nullable: true })
  @IsOptional()
  interestedUsers?: Types.ObjectId[] | IUser[];

  @Field(() => String)
  createdAt!: Date;
  @Field(() => String, { nullable: true })
  @IsOptional()
  updatedAt?: Date;
  @Field(() => String, { nullable: true })
  @IsOptional()
  deletedAt?: Date;
  @Field(() => String, { nullable: true })
  @IsOptional()
  restoredAt?: Date;
}
@ObjectType()
export class AllProductsPaginatedResponse {
  @Field(() => [OneProductResponse], { nullable: true })
  docs!: IProduct[];
  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  @Min(1)
  currentPage?: number;
  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  @Min(1)
  page?: number;
  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  @Min(1)
  size?: number;
}
