import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ForbiddenException } from '@nestjs/common';

import { OfficeLocation } from './entities/office-location.entity.js';
import { CreateOfficeLocationDto } from './dto/create-office-location.dto.js';
import { UpdateOfficeLocationDto } from './dto/update-office-location.dto.js';

import { EmployeeWorkLocationOverride } from './entities/employee-work-location-override.entity.js';
import { CreateEmployeeWorkLocationOverrideDto } from './dto/create-employee-work-location-override.dto.js';
import { UpdateEmployeeWorkLocationOverrideDto } from './dto/update-employee-work-location-override.dto.js';

import {
  TeamWorkLocationAssignment,
  WorkMode,
} from './entities/team-work-location-assignment.entity.js';
import { CreateTeamWorkLocationAssignmentDto } from './dto/create-team-work-location-assignment.dto.js';

import { Employee } from '../employees/entities/employee.entity.js';
import { UserRole } from '../users/entities/user.entity.js';

@Injectable()
export class WorkLocationService {
  constructor(
    @InjectRepository(OfficeLocation)
    private readonly officeLocationsRepository: Repository<OfficeLocation>,

    @InjectRepository(TeamWorkLocationAssignment)
    private readonly teamAssignmentsRepository: Repository<TeamWorkLocationAssignment>,

    @InjectRepository(Employee)
    private readonly employeesRepository: Repository<Employee>,

    @InjectRepository(EmployeeWorkLocationOverride)
    private readonly employeeOverridesRepository: Repository<EmployeeWorkLocationOverride>,
  ) {}

  async create(organizationId: string, dto: CreateOfficeLocationDto) {
    const existingOffice = await this.officeLocationsRepository.findOne({
      where: {
        organizationId,
        name: dto.name,
      },
    });

    if (existingOffice) {
      throw new ConflictException(
        'An office location with this name already exists',
      );
    }

    const officeLocation = this.officeLocationsRepository.create({
      organizationId,
      ...dto,
      isActive: true,
    });

    return this.officeLocationsRepository.save(officeLocation);
  }

  async findAll(organizationId: string) {
    return this.officeLocationsRepository.find({
      where: {
        organizationId,
      },
      order: {
        name: 'ASC',
      },
    });
  }

  async findOne(organizationId: string, id: string) {
    const officeLocation = await this.officeLocationsRepository.findOne({
      where: {
        id,
        organizationId,
      },
    });

    if (!officeLocation) {
      throw new NotFoundException('Office location not found');
    }

    return officeLocation;
  }

  async update(
    organizationId: string,
    id: string,
    dto: UpdateOfficeLocationDto,
  ) {
    const officeLocation = await this.findOne(organizationId, id);

    if (dto.name && dto.name !== officeLocation.name) {
      const existingOffice = await this.officeLocationsRepository.findOne({
        where: {
          organizationId,
          name: dto.name,
        },
      });

      if (existingOffice) {
        throw new ConflictException(
          'An office location with this name already exists',
        );
      }
    }

    Object.assign(officeLocation, dto);

    return this.officeLocationsRepository.save(officeLocation);
  }

  async deactivate(organizationId: string, id: string) {
    const officeLocation = await this.findOne(organizationId, id);

    if (!officeLocation.isActive) {
      throw new ConflictException('Office location is already inactive');
    }

    officeLocation.isActive = false;

    await this.officeLocationsRepository.save(officeLocation);

    return {
      message: 'Office location deactivated successfully',
    };
  }

  async activate(organizationId: string, id: string) {
    const officeLocation = await this.findOne(organizationId, id);

    if (officeLocation.isActive) {
      throw new ConflictException('Office location is already active');
    }

    officeLocation.isActive = true;

    await this.officeLocationsRepository.save(officeLocation);

    return {
      message: 'Office location activated successfully',
    };
  }

  async createTeamAssignment(
    organizationId: string,
    managerId: string,
    dto: CreateTeamWorkLocationAssignmentDto,
  ) {
    const manager = await this.employeesRepository.findOne({
      where: {
        id: managerId,
        organizationId,
      },
    });

    if (!manager) {
      throw new NotFoundException('Manager employee profile not found');
    }
    const existingAssignment = await this.teamAssignmentsRepository.findOne({
      where: {
        organizationId,
        managerId,
        isActive: true,
      },
    });

    if (existingAssignment) {
      throw new ConflictException(
        'An active team work location assignment already exists for this manager',
      );
    }

    if (dto.workMode === 'OFFICE' && !dto.officeLocationId) {
      throw new ConflictException(
        'Office location is required when work mode is OFFICE',
      );
    }

    if (dto.workMode === 'WFH' && dto.officeLocationId) {
      throw new ConflictException(
        'Office location must not be provided when work mode is WFH',
      );
    }

    if (dto.workMode === 'OFFICE') {
      const officeLocation = await this.officeLocationsRepository.findOne({
        where: {
          id: dto.officeLocationId,
          organizationId,
          isActive: true,
        },
      });

      if (!officeLocation) {
        throw new NotFoundException('Active office location not found');
      }
    }

    const assignment = this.teamAssignmentsRepository.create({
      organizationId,
      managerId,
      workMode: dto.workMode,
      officeLocationId: dto.officeLocationId ?? null,
      isActive: true,
    });

    return this.teamAssignmentsRepository.save(assignment);
  }

  async findTeamAssignment(organizationId: string, managerId: string) {
    const assignment = await this.teamAssignmentsRepository.findOne({
      where: {
        organizationId,
        managerId,
        isActive: true,
      },
      relations: {
        manager: true,
        officeLocation: true,
      },
    });

    if (!assignment) {
      throw new NotFoundException(
        'Active team work location assignment not found',
      );
    }

    return assignment;
  }

  async updateTeamAssignment(
    organizationId: string,
    managerId: string,
    dto: CreateTeamWorkLocationAssignmentDto,
  ) {
    const assignment = await this.teamAssignmentsRepository.findOne({
      where: {
        organizationId,
        managerId,
        isActive: true,
      },
    });

    if (!assignment) {
      throw new NotFoundException(
        'Active team work location assignment not found',
      );
    }

    if (dto.workMode === WorkMode.OFFICE && !dto.officeLocationId) {
      throw new ConflictException(
        'Office location is required when work mode is OFFICE',
      );
    }

    if (dto.workMode === WorkMode.WFH && dto.officeLocationId) {
      throw new ConflictException(
        'Office location must not be provided when work mode is WFH',
      );
    }

    if (dto.workMode === WorkMode.OFFICE) {
      const officeLocation = await this.officeLocationsRepository.findOne({
        where: {
          id: dto.officeLocationId,
          organizationId,
          isActive: true,
        },
      });

      if (!officeLocation) {
        throw new NotFoundException('Active office location not found');
      }
    }

    assignment.workMode = dto.workMode;
    assignment.officeLocationId = dto.officeLocationId ?? null;

    return this.teamAssignmentsRepository.save(assignment);
  }

  async deactivateTeamAssignment(organizationId: string, managerId: string) {
    const assignment = await this.teamAssignmentsRepository.findOne({
      where: {
        organizationId,
        managerId,
        isActive: true,
      },
    });

    if (!assignment) {
      throw new NotFoundException(
        'Active team work location assignment not found',
      );
    }

    assignment.isActive = false;

    await this.teamAssignmentsRepository.save(assignment);

    return {
      message: 'Team work location assignment deactivated successfully',
    };
  }

  async createEmployeeOverride(
    organizationId: string,
    userId: string,
    role: UserRole,
    employeeId: string,
    dto: CreateEmployeeWorkLocationOverrideDto,
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

    if (role === UserRole.MANAGER) {
      const managerEmployee = await this.employeesRepository.findOne({
        where: {
          userId,
          organizationId,
          isActive: true,
        },
      });

      if (!managerEmployee) {
        throw new ForbiddenException('Manager employee profile not found');
      }

      if (employee.managerId !== managerEmployee.id) {
        throw new ForbiddenException(
          'You can manage work-location overrides only for your direct reports',
        );
      }
    }

    if (dto.workMode === WorkMode.OFFICE && !dto.officeLocationId) {
      throw new ConflictException(
        'Office location is required when work mode is OFFICE',
      );
    }

    if (dto.workMode === WorkMode.WFH && dto.officeLocationId) {
      throw new ConflictException(
        'Office location must not be provided when work mode is WFH',
      );
    }

    if (dto.endDate && dto.endDate < dto.startDate) {
      throw new ConflictException('End date cannot be before start date');
    }

    if (dto.workMode === WorkMode.OFFICE) {
      const officeLocation = await this.officeLocationsRepository.findOne({
        where: {
          id: dto.officeLocationId,
          organizationId,
          isActive: true,
        },
      });

      if (!officeLocation) {
        throw new NotFoundException('Active office location not found');
      }
    }

    const override = this.employeeOverridesRepository.create({
      organizationId,
      employeeId,
      workMode: dto.workMode,
      officeLocationId: dto.officeLocationId ?? null,
      startDate: dto.startDate,
      endDate: dto.endDate ?? null,
      isActive: true,
    });

    return this.employeeOverridesRepository.save(override);
  }

  async getEffectiveWorkLocation(
    organizationId: string,
    employeeId: string,
    targetDate?: string,
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

    const date = targetDate ?? new Date().toISOString().split('T')[0];

    // 1. Employee override has highest priority
    const employeeOverride = await this.employeeOverridesRepository
      .createQueryBuilder('override')
      .leftJoinAndSelect('override.officeLocation', 'officeLocation')
      .where('override.organization_id = :organizationId', {
        organizationId,
      })
      .andWhere('override.employee_id = :employeeId', {
        employeeId,
      })
      .andWhere('override.is_active = true')
      .andWhere('override.start_date <= :date', { date })
      .andWhere('(override.end_date IS NULL OR override.end_date >= :date)', {
        date,
      })
      .orderBy('override.start_date', 'DESC')
      .getOne();

    if (employeeOverride) {
      return {
        employeeId,
        date,
        source: 'EMPLOYEE_OVERRIDE',
        workMode: employeeOverride.workMode,
        officeLocation: employeeOverride.officeLocation
          ? {
              id: employeeOverride.officeLocation.id,
              name: employeeOverride.officeLocation.name,
              address: employeeOverride.officeLocation.address,
              latitude: employeeOverride.officeLocation.latitude,
              longitude: employeeOverride.officeLocation.longitude,
              radiusMeters: employeeOverride.officeLocation.radiusMeters,
            }
          : null,
      };
    }

    // 2. Team assignment is the fallback
    if (employee.managerId) {
      const teamAssignment = await this.teamAssignmentsRepository.findOne({
        where: {
          organizationId,
          managerId: employee.managerId,
          isActive: true,
        },
        relations: {
          officeLocation: true,
        },
      });

      if (teamAssignment) {
        return {
          employeeId,
          date,
          source: 'TEAM_ASSIGNMENT',
          workMode: teamAssignment.workMode,
          officeLocation: teamAssignment.officeLocation
            ? {
                id: teamAssignment.officeLocation.id,
                name: teamAssignment.officeLocation.name,
                address: teamAssignment.officeLocation.address,
                latitude: teamAssignment.officeLocation.latitude,
                longitude: teamAssignment.officeLocation.longitude,
                radiusMeters: teamAssignment.officeLocation.radiusMeters,
              }
            : null,
        };
      }
    }

    // 3. No assignment
    return {
      employeeId,
      date,
      source: 'NONE',
      workMode: null,
      officeLocation: null,
    };
  }

  async activateTeamAssignment(organizationId: string, managerId: string) {
    const assignment = await this.teamAssignmentsRepository.findOne({
      where: {
        organizationId,
        managerId,
        isActive: false,
      },
      relations: {
        manager: true,
        officeLocation: true,
      },
    });

    if (!assignment) {
      throw new NotFoundException(
        'Inactive team work location assignment not found',
      );
    }

    assignment.isActive = true;

    return this.teamAssignmentsRepository.save(assignment);
  }

  async findEmployeeOverrides(organizationId: string, employeeId: string) {
    const employee = await this.employeesRepository.findOne({
      where: {
        id: employeeId,
        organizationId,
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return this.employeeOverridesRepository.find({
      where: {
        organizationId,
        employeeId,
      },
      relations: {
        officeLocation: true,
      },
      order: {
        startDate: 'DESC',
      },
    });
  }

  async updateEmployeeOverride(
    organizationId: string,
    userId: string,
    role: UserRole,
    overrideId: string,
    dto: UpdateEmployeeWorkLocationOverrideDto,
  ) {
    const override = await this.employeeOverridesRepository.findOne({
      where: {
        id: overrideId,
        organizationId,
      },
    });

    if (!override) {
      throw new NotFoundException('Employee work location override not found');
    }

    if (role === UserRole.MANAGER) {
      const managerEmployee = await this.employeesRepository.findOne({
        where: {
          userId,
          organizationId,
          isActive: true,
        },
      });

      if (!managerEmployee) {
        throw new ForbiddenException('Manager employee profile not found');
      }

      const employee = await this.employeesRepository.findOne({
        where: {
          id: override.employeeId,
          organizationId,
        },
      });

      if (!employee) {
        throw new NotFoundException('Employee not found');
      }

      if (employee.managerId !== managerEmployee.id) {
        throw new ForbiddenException(
          'You can manage work-location overrides only for your direct reports',
        );
      }
    }

    const workMode = dto.workMode ?? override.workMode;
    const officeLocationId =
      workMode === WorkMode.WFH
        ? null
        : dto.officeLocationId !== undefined
          ? dto.officeLocationId
          : override.officeLocationId;
    const startDate = dto.startDate ?? override.startDate;
    const endDate = dto.endDate !== undefined ? dto.endDate : override.endDate;

    if (workMode === WorkMode.OFFICE && !officeLocationId) {
      throw new ConflictException(
        'Office location is required when work mode is OFFICE',
      );
    }

    if (workMode === WorkMode.WFH && officeLocationId) {
      throw new ConflictException(
        'Office location must not be provided when work mode is WFH',
      );
    }

    if (endDate && endDate < startDate) {
      throw new ConflictException('End date cannot be before start date');
    }

    if (workMode === WorkMode.OFFICE) {
      if (!officeLocationId) {
        throw new ConflictException(
          'Office location is required when work mode is OFFICE',
        );
      }

      const officeLocation = await this.officeLocationsRepository.findOne({
        where: {
          id: officeLocationId,
          organizationId,
          isActive: true,
        },
      });

      if (!officeLocation) {
        throw new NotFoundException('Active office location not found');
      }
    }

    if (dto.startDate !== undefined && dto.startDate !== override.startDate) {
      const duplicate = await this.employeeOverridesRepository.findOne({
        where: {
          organizationId,
          employeeId: override.employeeId,
          startDate: dto.startDate,
        },
      });

      if (duplicate && duplicate.id !== override.id) {
        throw new ConflictException(
          'An override already exists for this employee with the same start date',
        );
      }
    }

    override.workMode = workMode;
    override.officeLocationId =
      workMode === WorkMode.OFFICE ? officeLocationId! : null;
    override.startDate = startDate;
    override.endDate = endDate;

    if (dto.isActive !== undefined) {
      override.isActive = dto.isActive;
    }

    return this.employeeOverridesRepository.save(override);
  }

  async deactivateEmployeeOverride(
    organizationId: string,
    userId: string,
    role: UserRole,
    overrideId: string,
  ) {
    const override = await this.employeeOverridesRepository.findOne({
      where: {
        id: overrideId,
        organizationId,
      },
    });

    if (!override) {
      throw new NotFoundException('Employee work location override not found');
    }

    if (role === UserRole.MANAGER) {
      const managerEmployee = await this.employeesRepository.findOne({
        where: {
          userId,
          organizationId,
          isActive: true,
        },
      });

      if (!managerEmployee) {
        throw new ForbiddenException('Manager employee profile not found');
      }

      const employee = await this.employeesRepository.findOne({
        where: {
          id: override.employeeId,
          organizationId,
        },
      });

      if (!employee) {
        throw new NotFoundException('Employee not found');
      }

      if (employee.managerId !== managerEmployee.id) {
        throw new ForbiddenException(
          'You can manage work-location overrides only for your direct reports',
        );
      }
    }

    if (!override.isActive) {
      throw new ConflictException(
        'Employee work location override is already inactive',
      );
    }

    override.isActive = false;

    return this.employeeOverridesRepository.save(override);
  }

  async activateEmployeeOverride(
    organizationId: string,
    userId: string,
    role: UserRole,
    overrideId: string,
  ) {
    const override = await this.employeeOverridesRepository.findOne({
      where: {
        id: overrideId,
        organizationId,
      },
    });

    if (!override) {
      throw new NotFoundException('Employee work location override not found');
    }

    if (override.isActive) {
      throw new ConflictException(
        'Employee work location override is already active',
      );
    }

    if (role === UserRole.MANAGER) {
      const managerEmployee = await this.employeesRepository.findOne({
        where: {
          userId,
          organizationId,
          isActive: true,
        },
      });

      if (!managerEmployee) {
        throw new ForbiddenException('Manager employee profile not found');
      }

      const employee = await this.employeesRepository.findOne({
        where: {
          id: override.employeeId,
          organizationId,
        },
      });

      if (!employee) {
        throw new NotFoundException('Employee not found');
      }

      if (employee.managerId !== managerEmployee.id) {
        throw new ForbiddenException(
          'You can manage work-location overrides only for your direct reports',
        );
      }
    }

    override.isActive = true;

    return this.employeeOverridesRepository.save(override);
  }
}
