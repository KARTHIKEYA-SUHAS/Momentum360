import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { Organization } from '../../organizations/entities/organization.entity.js';
import { User } from '../../users/entities/user.entity.js';
import { Department } from '../../departments/entities/department.entity.js';

export enum EmploymentStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ON_LEAVE = 'ON_LEAVE',
  TERMINATED = 'TERMINATED',
}

@Unique(['organizationId', 'employeeCode'])
@Entity('employees')
export class Employee {
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

  @OneToOne(() => User, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @Column({
    name: 'user_id',
    type: 'uuid',
    nullable: true,
    unique: true,
  })
  userId: string | null;

  @Column({
    name: 'employee_code',
    type: 'varchar',
    length: 50,
  })
  employeeCode: string;

  @Column({
    name: 'first_name',
    type: 'varchar',
    length: 100,
  })
  firstName: string;

  @Column({
    name: 'last_name',
    type: 'varchar',
    length: 100,
  })
  lastName: string;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  phone: string | null;

  @Column({
    name: 'date_of_joining',
    type: 'date',
  })
  dateOfJoining: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  designation: string | null;

  @ManyToOne(() => Department, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @Column({
    name: 'department_id',
    type: 'uuid',
  })
  departmentId: string;

  @ManyToOne(() => Employee, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'manager_id' })
  manager: Employee | null;

  @Column({
    name: 'manager_id',
    type: 'uuid',
    nullable: true,
  })
  managerId: string | null;

  @OneToMany(() => Employee, (employee) => employee.manager)
  subordinates: Employee[];

  @Column({
    type: 'enum',
    enum: EmploymentStatus,
    default: EmploymentStatus.ACTIVE,
  })
  status: EmploymentStatus;

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
