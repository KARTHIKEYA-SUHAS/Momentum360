import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Leave } from './entities/leave.entity.js';
import { Employee } from '../employees/entities/employee.entity.js';
import { EmployeesModule } from '../employees/employees.module.js';
import { EmployeeReportingManager } from '../employees/entities/employee-reporting-manager.entity.js';
import { LeaveService } from './leave.service.js';
import { LeaveController } from './leave.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Leave, Employee, EmployeeReportingManager]),
    EmployeesModule,
  ],
  controllers: [LeaveController],
  providers: [LeaveService],
  exports: [LeaveService],
})
export class LeaveModule {}
