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
import { User } from '../../users/entities/user.entity.js';

import { WorkMode } from '../../work-location/entities/team-work-location-assignment.entity.js';

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  HALF_DAY = 'HALF_DAY',
  ON_LEAVE = 'ON_LEAVE',
  HOLIDAY = 'HOLIDAY',
}

@Unique(['employeeId', 'attendanceDate'])
@Entity('attendance')
export class Attendance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Organization, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({
    name: 'organization_id',
    type: 'uuid',
  })
  organizationId: string;

  @ManyToOne(() => Employee, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({
    name: 'employee_id',
    type: 'uuid',
  })
  employeeId: string;

  @Column({
    name: 'attendance_date',
    type: 'date',
  })
  attendanceDate: string;

  @Column({
    type: 'enum',
    enum: AttendanceStatus,
  })
  status: AttendanceStatus;

  @Column({
    name: 'check_in',
    type: 'timestamptz',
    nullable: true,
  })
  checkIn: Date | null;

  @Column({
    name: 'check_out',
    type: 'timestamptz',
    nullable: true,
  })
  checkOut: Date | null;

  @Column({
    name: 'work_mode',
    type: 'enum',
    enum: WorkMode,
    nullable: true,
  })
  workMode: WorkMode | null;

  @Column({
    name: 'check_in_latitude',
    type: 'decimal',
    precision: 10,
    scale: 7,
    nullable: true,
  })
  checkInLatitude: number | null;

  @Column({
    name: 'check_in_longitude',
    type: 'decimal',
    precision: 10,
    scale: 7,
    nullable: true,
  })
  checkInLongitude: number | null;

  @ManyToOne(() => User, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'marked_by_user_id' })
  markedByUser: User | null;

  @Column({
    name: 'marked_by_user_id',
    type: 'uuid',
    nullable: true,
  })
  markedByUserId: string | null;

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
