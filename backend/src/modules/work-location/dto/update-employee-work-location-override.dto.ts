import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';

import { WorkMode } from '../entities/team-work-location-assignment.entity.js';

export class UpdateEmployeeWorkLocationOverrideDto {
  @IsOptional()
  @IsEnum(WorkMode)
  workMode?: WorkMode;

  @IsOptional()
  @IsUUID()
  officeLocationId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  isActive?: boolean;
}
