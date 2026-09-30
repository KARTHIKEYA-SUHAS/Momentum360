import { IsOptional, IsString, Length, MaxLength } from 'class-validator';

export class CreateDepartmentDto {
  @IsString()
  @Length(2, 150)
  name: string;

  @IsString()
  @Length(2, 50)
  code: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;
}
