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

export enum WorkMode {
  OFFICE = 'OFFICE',
  WFH = 'WFH',
}

@Unique(['organizationId', 'managerId'])
@Entity('team_work_location_assignments')
export class TeamWorkLocationAssignment {
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
  @JoinColumn({ name: 'manager_id' })
  manager: Employee;

  @Column({ name: 'manager_id', type: 'uuid' })
  managerId: string;

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
