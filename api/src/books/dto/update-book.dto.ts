import { IsString, IsNotEmpty, IsOptional, IsUUID, IsInt, Min } from 'class-validator';

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

  @IsInt()
  @Min(0)
  @IsOptional()
  totalCopies?: number;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @IsUUID()
  genreId?: string;
}
