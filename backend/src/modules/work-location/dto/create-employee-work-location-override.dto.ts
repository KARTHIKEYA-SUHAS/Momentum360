import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';

import { WorkMode } from '../entities/team-work-location-assignment.entity.js';

export class CreateEmployeeWorkLocationOverrideDto {
  @IsEnum(WorkMode)
  workMode: WorkMode;

  @IsOptional()
  @IsUUID()
  officeLocationId?: string;

  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
