import { IsEnum, IsOptional, IsUUID } from 'class-validator';

import { WorkMode } from '../entities/team-work-location-assignment.entity.js';

export class CreateTeamWorkLocationAssignmentDto {
  @IsEnum(WorkMode)
  workMode: WorkMode;

  @IsOptional()
  @IsUUID()
  officeLocationId?: string;
}
