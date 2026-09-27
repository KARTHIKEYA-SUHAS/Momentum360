import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Department } from './entities/department.entity.js';
import { CreateDepartmentDto } from './dto/create-department.dto.js';
import { UpdateDepartmentDto } from './dto/update-department.dto.js';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentsRepository: Repository<Department>,
  ) {}

  async create(
    organizationId: string,
    createDepartmentDto: CreateDepartmentDto,
  ) {
    const existingDepartment = await this.departmentsRepository.findOne({
      where: {
        organizationId,
        code: createDepartmentDto.code,
      },
    });

    if (existingDepartment) {
      throw new ConflictException(
        'Department code already exists in this organization',
      );
    }

    const department = this.departmentsRepository.create({
      organizationId,
      name: createDepartmentDto.name,
      code: createDepartmentDto.code,
      description: createDepartmentDto.description ?? null,
      isActive: true,
    });

    return this.departmentsRepository.save(department);
  }

  async findAll(organizationId: string) {
    return this.departmentsRepository.find({
      where: {
        organizationId,
      },
      order: {
        name: 'ASC',
      },
    });
  }

  async findOne(organizationId: string, id: string) {
    const department = await this.departmentsRepository.findOne({
      where: {
        id,
        organizationId,
      },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    return department;
  }

  async update(
    organizationId: string,
    id: string,
    updateDepartmentDto: UpdateDepartmentDto,
  ) {
    const department = await this.findOne(organizationId, id);

    if (updateDepartmentDto.code) {
      const existingDepartment = await this.departmentsRepository.findOne({
        where: {
          organizationId,
          code: updateDepartmentDto.code,
        },
      });

      if (existingDepartment && existingDepartment.id !== department.id) {
        throw new ConflictException(
          'Department code already exists in this organization',
        );
      }
    }

    Object.assign(department, updateDepartmentDto);

    return this.departmentsRepository.save(department);
  }

  async deactivate(organizationId: string, id: string) {
    const department = await this.findOne(organizationId, id);

    department.isActive = false;

    return this.departmentsRepository.save(department);
  }

  async activate(organizationId: string, id: string) {
    const department = await this.findOne(organizationId, id);

    department.isActive = true;

    return this.departmentsRepository.save(department);
  }
}
