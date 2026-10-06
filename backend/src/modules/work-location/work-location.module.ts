import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OfficeLocation } from './entities/office-location.entity.js';
import { WorkLocationController } from './work-location.controller.js';
import { WorkLocationService } from './work-location.service.js';
import { TeamWorkLocationAssignment } from './entities/team-work-location-assignment.entity.js';
import { EmployeeWorkLocationOverride } from './entities/employee-work-location-override.entity.js';

import { Employee } from '../employees/entities/employee.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OfficeLocation,
      TeamWorkLocationAssignment,
      Employee,
      EmployeeWorkLocationOverride,
    ]),
  ],
  controllers: [WorkLocationController],
  providers: [WorkLocationService],
  exports: [WorkLocationService],
})
export class WorkLocationModule {}
