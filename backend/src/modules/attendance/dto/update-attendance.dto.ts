import { IsDateString, IsEnum, IsOptional } from 'class-validator';

import { AttendanceStatus } from '../entities/attendance.entity.js';

export class UpdateAttendanceDto {
  @IsOptional()
  @IsDateString()
  attendanceDate?: string;

  @IsOptional()
  @IsEnum(AttendanceStatus)
  status?: AttendanceStatus;

  @IsOptional()
  @IsDateString()
  checkIn?: string;

  @IsOptional()
  @IsDateString()
  checkOut?: string;
}
