import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';

import { AttendanceStatus } from '../entities/attendance.entity.js';

export class CreateAttendanceDto {
  @IsUUID()
  employeeId: string;

  @IsDateString()
  attendanceDate: string;

  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;

  @IsOptional()
  @IsDateString()
  checkIn?: string;

  @IsOptional()
  @IsDateString()
  checkOut?: string;
}
