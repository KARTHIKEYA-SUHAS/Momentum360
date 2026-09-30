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

@Entity('holidays')
@Unique(['organizationId', 'date', 'name'])
export class Holiday {
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

  @Column({
    type: 'varchar',
    length: 150,
  })
  name: string;

  @Column({
    type: 'date',
  })
  date: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string | null;

  @Column({
    name: 'is_optional',
    type: 'boolean',
    default: false,
  })
  isOptional: boolean;

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
