import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateHolidayDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsBoolean()
  isOptional?: boolean;
}
