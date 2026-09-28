import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AttendanceController } from './attendance.controller.js';
import { AttendanceService } from './attendance.service.js';

import { Attendance } from './entities/attendance.entity.js';
import { Employee } from '../employees/entities/employee.entity.js';
import { EmployeesModule } from '../employees/employees.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Attendance, Employee]), EmployeesModule],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
