import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class UpdateBookDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  title?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  author?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  isbn?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  publishedAt?: Date;

  @IsOptional()
  available?: boolean;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @IsUUID()
  genreId?: string;
}
