import {
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class CreateDepartmentDto {
  @IsString()
  @Length(2, 150)
  name: string;

  @IsString()
  @Length(2, 50)
  code: string;

  @IsOptional()
  @IsString()
  description?: string;
}