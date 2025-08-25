import { IsInt, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateLibrarySettingDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  loanDurationDays?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  overdueFinePerDay?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxBooksPerUser?: number;
}
