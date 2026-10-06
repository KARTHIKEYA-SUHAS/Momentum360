import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { Organization } from '../../organizations/entities/organization.entity.js';
import { Employee } from '../../employees/entities/employee.entity.js';
import { OfficeLocation } from './office-location.entity.js';
import { WorkMode } from './team-work-location-assignment.entity.js';

@Unique(['organizationId', 'employeeId', 'startDate'])
@Entity('employee_work_location_overrides')
export class EmployeeWorkLocationOverride {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Organization, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ name: 'organization_id', type: 'uuid' })
  organizationId: string;

  @ManyToOne(() => Employee, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ name: 'employee_id', type: 'uuid' })
  employeeId: string;

  @Column({
    name: 'work_mode',
    type: 'enum',
    enum: WorkMode,
  })
  workMode: WorkMode;

  @ManyToOne(() => OfficeLocation, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'office_location_id' })
  officeLocation: OfficeLocation | null;

  @Column({
    name: 'office_location_id',
    type: 'uuid',
    nullable: true,
  })
  officeLocationId: string | null;

  @Column({
    name: 'start_date',
    type: 'date',
  })
  startDate: string;

  @Column({
    name: 'end_date',
    type: 'date',
    nullable: true,
  })
  endDate: string | null;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive: boolean;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
  })
  updatedAt: Date;
}
