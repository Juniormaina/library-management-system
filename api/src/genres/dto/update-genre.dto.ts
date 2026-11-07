import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateGenreDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
