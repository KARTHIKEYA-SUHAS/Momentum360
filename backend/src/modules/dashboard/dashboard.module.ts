import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DashboardController } from './dashboard.controller.js';
import { DashboardService } from './dashboard.service.js';

import { Employee } from '../employees/entities/employee.entity.js';
import { Attendance } from '../attendance/entities/attendance.entity.js';
import { Leave } from '../leave/entities/leave.entity.js';
import { Holiday } from '../holidays/entities/holiday.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Employee, Attendance, Leave, Holiday])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
