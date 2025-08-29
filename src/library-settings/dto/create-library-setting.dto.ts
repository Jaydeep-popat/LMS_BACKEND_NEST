import { IsInt, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class CreateLibrarySettingDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  loanDurationDays?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  overdueFinePerDay?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  maxBooksPerUser?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  maxDVDsPerUser?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  maxMagazinesPerUser?: number;
}
