import { IsString, IsNotEmpty, IsOptional, IsUUID, IsInt, Min } from 'class-validator';

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

  @IsInt()
  @Min(0)
  @IsOptional()
  totalCopies?: number;

  @IsString()
  @IsNotEmpty()
  @IsUUID()
  genreId: string;
}
