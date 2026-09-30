import { IsOptional, IsString, Length, MaxLength } from 'class-validator';

export class UpdateDepartmentDto {
  @IsOptional()
  @IsString()
  @Length(2, 150)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(2, 50)
  code?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;
}
