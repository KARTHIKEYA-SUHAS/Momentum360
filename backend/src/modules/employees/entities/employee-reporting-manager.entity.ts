import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { Employee } from './employee.entity.js';

@Entity('employee_reporting_managers')
@Unique(['employeeId', 'reportingManagerId'])
export class EmployeeReportingManager {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Employee, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({
    name: 'employee_id',
    type: 'uuid',
  })
  employeeId: string;

  @ManyToOne(() => Employee, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'reporting_manager_id' })
  reportingManager: Employee;

  @Column({
    name: 'reporting_manager_id',
    type: 'uuid',
  })
  reportingManagerId: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt: Date;
}
