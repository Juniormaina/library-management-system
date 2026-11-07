import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class BooksQueryDto {
  @IsString()
  @IsOptional()
  genreId?: string;

  @IsString()
  @IsOptional()
  search?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => parseInt(String(value), 10))
  page?: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => parseInt(String(value), 10))
  limit?: number;
}
