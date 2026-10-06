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

import { EmployeeReportingManager } from './entities/employee-reporting-manager.entity.js';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeesRepository: Repository<Employee>,

    @InjectRepository(Department)
    private readonly departmentsRepository: Repository<Department>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(EmployeeReportingManager)
    private readonly reportingManagersRepository: Repository<EmployeeReportingManager>,
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
      await this.validateManagerAssignment(organizationId, null, managerId);
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
        manager: true,
        subordinates: true,
      },
    });
  }

  async addReportingManager(
    organizationId: string,
    employeeId: string,
    reportingManagerId: string,
  ) {
    if (employeeId === reportingManagerId) {
      throw new ConflictException(
        'An employee cannot be their own reporting manager',
      );
    }

    const employee = await this.employeesRepository.findOne({
      where: {
        id: employeeId,
        organizationId,
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const reportingManager = await this.employeesRepository.findOne({
      where: {
        id: reportingManagerId,
        organizationId,
      },
    });

    if (!reportingManager) {
      throw new NotFoundException('Reporting manager not found');
    }

    if (!reportingManager.isActive) {
      throw new ConflictException(
        'Cannot assign an inactive employee as reporting manager',
      );
    }

    const existingRelationship = await this.reportingManagersRepository.findOne(
      {
        where: {
          employeeId,
          reportingManagerId,
        },
      },
    );

    if (existingRelationship) {
      throw new ConflictException(
        'This reporting manager is already assigned to the employee',
      );
    }

    const relationship = this.reportingManagersRepository.create({
      employeeId,
      reportingManagerId,
    });

    return this.reportingManagersRepository.save(relationship);
  }

  async getReportingManagers(organizationId: string, employeeId: string) {
    const employee = await this.employeesRepository.findOne({
      where: {
        id: employeeId,
        organizationId,
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return this.reportingManagersRepository.find({
      where: {
        employeeId,
      },
      relations: {
        reportingManager: true,
      },
      order: {
        createdAt: 'ASC',
      },
    });
  }

  async removeReportingManager(
    organizationId: string,
    employeeId: string,
    reportingManagerId: string,
  ) {
    const employee = await this.employeesRepository.findOne({
      where: {
        id: employeeId,
        organizationId,
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const relationship = await this.reportingManagersRepository.findOne({
      where: {
        employeeId,
        reportingManagerId,
      },
    });

    if (!relationship) {
      throw new NotFoundException('Reporting manager relationship not found');
    }

    await this.reportingManagersRepository.remove(relationship);

    return {
      message: 'Reporting manager removed successfully',
    };
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
      await this.validateManagerAssignment(
        organizationId,
        employee.id,
        updateEmployeeDto.managerId,
      );
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

  private async validateManagerAssignment(
    organizationId: string,
    employeeId: string | null,
    managerId: string,
  ): Promise<void> {
    /*
     * Prevent self-management
     */
    if (employeeId && managerId === employeeId) {
      throw new ConflictException('An employee cannot be their own manager');
    }

    /*
     * Find proposed manager
     */
    const manager = await this.employeesRepository.findOne({
      where: {
        id: managerId,
        organizationId,
      },
    });

    if (!manager) {
      throw new NotFoundException('Manager not found');
    }

    /*
     * Manager must be active
     */
    if (!manager.isActive) {
      throw new ConflictException(
        'Cannot assign an inactive employee as manager',
      );
    }

    /*
     * Walk through the manager hierarchy
     * to detect circular relationships.
     */
    let currentManagerId = manager.managerId;

    while (currentManagerId) {
      /*
       * If we reach the employee being updated,
       * assigning this manager would create:
       *
       * A → B → C → A
       */
      if (employeeId && currentManagerId === employeeId) {
        throw new ConflictException(
          'Manager assignment would create a reporting hierarchy cycle',
        );
      }

      const currentManager = await this.employeesRepository.findOne({
        where: {
          id: currentManagerId,
          organizationId,
        },

        select: {
          id: true,
          managerId: true,
        },
      });

      /*
       * If the referenced manager no longer exists,
       * stop traversing the hierarchy.
       */
      if (!currentManager) {
        break;
      }

      currentManagerId = currentManager.managerId;
    }
  }
}
