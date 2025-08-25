import { IsDateString, IsEnum, IsString, MinLength } from 'class-validator';
import { Genre } from '../../common/enums';

export class CreateBookDto {
  @IsString()
  @MinLength(1)
  title: string;  

  @IsString()
  @MinLength(1)
  author: string;

  @IsEnum(Genre)
  genre: Genre;

  @IsDateString()
  publishedAt: string;
}
