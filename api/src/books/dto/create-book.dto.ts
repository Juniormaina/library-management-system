import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  author: string;

  @IsString()
  @IsNotEmpty()
  isbn: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  publishedAt?: Date;

  @IsOptional()
  available?: boolean;

  @IsString()
  @IsNotEmpty()
  @IsUUID()
  genreId: string;
}
