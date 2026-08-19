import { ArgsType, Field, Int } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class PaginateDto {
  @Transform(({ value }) => Number(value))
  @IsInt()
  @IsOptional()
  @Min(1)
  page?: number;
  @Transform(({ value }) => Number(value))
  @IsInt()
  @IsOptional()
  @Min(1)
  size?: number;
  @IsOptional()
  @IsString()
  search?: string;
}
