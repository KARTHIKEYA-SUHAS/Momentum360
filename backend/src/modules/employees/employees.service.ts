import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Employee, EmploymentStatus } from './entities/employee.entity.js';

import { CreateEmployeeDto } from './dto/create-employee.dto.js';

import { UpdateEmployeeDto } from './dto/update-employee.dto.js';

import { Department } from '../departments/entities/department.entity.js';

import { User } from '../users/entities/user.entity.js';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeesRepository: Repository<Employee>,

    @InjectRepository(Department)
    private readonly departmentsRepository: Repository<Department>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(organizationId: string, createEmployeeDto: CreateEmployeeDto) {
    const { employeeCode, departmentId, managerId, userId } = createEmployeeDto;

    const existingEmployee = await this.employeesRepository.findOne({
      where: {
        organizationId,
        employeeCode,
      },
    });

    if (existingEmployee) {
      throw new ConflictException(
        'Employee code already exists in this organization',
      );
    }

    const department = await this.departmentsRepository.findOne({
      where: {
        id: departmentId,
        organizationId,
      },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    if (!department.isActive) {
      throw new ConflictException(
        'Cannot assign employee to an inactive department',
      );
    }

    if (managerId) {
      const manager = await this.employeesRepository.findOne({
        where: {
          id: managerId,
          organizationId,
        },
      });

      if (!manager) {
        throw new NotFoundException('Manager not found');
      }

      if (!manager.isActive) {
        throw new ConflictException(
          'Cannot assign an inactive employee as manager',
        );
      }
    }

    if (userId) {
      const user = await this.usersRepository.findOne({
        where: {
          id: userId,
          organizationId,
        },
      });

      if (!user) {
        throw new NotFoundException('User account not found');
      }

      const linkedEmployee = await this.employeesRepository.findOne({
        where: {
          userId,
        },
      });

      if (linkedEmployee) {
        throw new ConflictException(
          'This user account is already linked to an employee',
        );
      }
    }

    const employee = this.employeesRepository.create({
      organizationId,

      employeeCode: createEmployeeDto.employeeCode,

      firstName: createEmployeeDto.firstName,

      lastName: createEmployeeDto.lastName,

      phone: createEmployeeDto.phone ?? null,

      dateOfJoining: createEmployeeDto.dateOfJoining,

      designation: createEmployeeDto.designation ?? null,

      departmentId: createEmployeeDto.departmentId,

      managerId: managerId ?? null,

      userId: userId ?? null,

      status: EmploymentStatus.ACTIVE,

      isActive: true,
    });

    return this.employeesRepository.save(employee);
  }

  async findAll(organizationId: string) {
    return this.employeesRepository.find({
      where: {
        organizationId,
      },
      relations: {
        department: true,
        manager: true,
      },
      order: {
        firstName: 'ASC',
        lastName: 'ASC',
      },
    });
  }

  async findOne(organizationId: string, id: string) {
    const employee = await this.employeesRepository.findOne({
      where: {
        id,
        organizationId,
      },
      relations: {
        department: true,
        manager: true,
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return employee;
  }

  async findByUserId(
    organizationId: string,
    userId: string,
  ): Promise<Employee | null> {
    return this.employeesRepository.findOne({
      where: {
        organizationId,
        userId,
      },
      relations: {
        subordinates: true,
      },
    });
  }

  async update(
    organizationId: string,
    id: string,
    updateEmployeeDto: UpdateEmployeeDto,
  ) {
    const employee = await this.findOne(organizationId, id);

    if (updateEmployeeDto.employeeCode) {
      const existingEmployee = await this.employeesRepository.findOne({
        where: {
          organizationId,
          employeeCode: updateEmployeeDto.employeeCode,
        },
      });

      if (existingEmployee && existingEmployee.id !== employee.id) {
        throw new ConflictException(
          'Employee code already exists in this organization',
        );
      }
    }

    if (updateEmployeeDto.departmentId) {
      const department = await this.departmentsRepository.findOne({
        where: {
          id: updateEmployeeDto.departmentId,
          organizationId,
        },
      });

      if (!department) {
        throw new NotFoundException('Department not found');
      }

      if (!department.isActive) {
        throw new ConflictException(
          'Cannot assign employee to an inactive department',
        );
      }
    }

    if (updateEmployeeDto.managerId) {
      if (updateEmployeeDto.managerId === employee.id) {
        throw new ConflictException('An employee cannot be their own manager');
      }

      const manager = await this.employeesRepository.findOne({
        where: {
          id: updateEmployeeDto.managerId,
          organizationId,
        },
      });

      if (!manager) {
        throw new NotFoundException('Manager not found');
      }

      if (!manager.isActive) {
        throw new ConflictException(
          'Cannot assign an inactive employee as manager',
        );
      }
    }

    if (updateEmployeeDto.userId) {
      const user = await this.usersRepository.findOne({
        where: {
          id: updateEmployeeDto.userId,
          organizationId,
        },
      });

      if (!user) {
        throw new NotFoundException('User account not found');
      }

      const linkedEmployee = await this.employeesRepository.findOne({
        where: {
          userId: updateEmployeeDto.userId,
        },
      });

      if (linkedEmployee && linkedEmployee.id !== employee.id) {
        throw new ConflictException(
          'This user account is already linked to another employee',
        );
      }
    }

    Object.assign(employee, updateEmployeeDto);

    return this.employeesRepository.save(employee);
  }

  async deactivate(organizationId: string, id: string) {
    const employee = await this.findOne(organizationId, id);

    employee.isActive = false;
    employee.status = EmploymentStatus.INACTIVE;

    return this.employeesRepository.save(employee);
  }

  async activate(organizationId: string, id: string) {
    const employee = await this.findOne(organizationId, id);

    employee.isActive = true;
    employee.status = EmploymentStatus.ACTIVE;

    return this.employeesRepository.save(employee);
  }
}
