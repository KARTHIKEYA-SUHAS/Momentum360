import {
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  MaxLength,
} from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  @Length(2, 50)
  employeeCode: string;

  @IsString()
  @Length(2, 100)
  firstName: string;

  @IsString()
  @Length(1, 100)
  lastName: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsDateString()
  dateOfJoining: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  designation?: string;

  @IsUUID()
  departmentId: string;

  @IsOptional()
  @IsUUID()
  managerId?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;
}