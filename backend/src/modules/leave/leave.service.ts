import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Leave, LeaveStatus } from './entities/leave.entity.js';

import { Employee } from '../employees/entities/employee.entity.js';
import { EmployeesService } from '../employees/employees.service.js';

import { CreateLeaveDto } from './dto/create-leave.dto.js';
import { UpdateLeaveDto } from './dto/update-leave.dto.js';

@Injectable()
export class LeaveService {
  constructor(
    @InjectRepository(Leave)
    private readonly leaveRepository: Repository<Leave>,

    private readonly employeesService: EmployeesService,
  ) {}

  private calculateLeaveDays(startDate: string, endDate: string): number {
    const start = new Date(`${startDate}T00:00:00Z`);
    const end = new Date(`${endDate}T00:00:00Z`);

    const difference = end.getTime() - start.getTime();

    return Math.floor(difference / (1000 * 60 * 60 * 24)) + 1;
  }

  async create(organizationId: string, userId: string, data: CreateLeaveDto) {
    const employee = await this.employeesService.findByUserId(
      organizationId,
      userId,
    );

    if (!employee) {
      throw new NotFoundException('Employee profile not found for this user');
    }

    if (!employee.isActive) {
      throw new ConflictException('Inactive employees cannot apply for leave');
    }

    if (data.startDate > data.endDate) {
      throw new ConflictException('Leave start date cannot be after end date');
    }

    const overlappingLeave = await this.leaveRepository
      .createQueryBuilder('leave')
      .where('leave.organization_id = :organizationId', { organizationId })
      .andWhere('leave.employee_id = :employeeId', { employeeId: employee.id })
      .andWhere('leave.status IN (:...statuses)', {
        statuses: [LeaveStatus.PENDING, LeaveStatus.APPROVED],
      })
      .andWhere('leave.start_date <= :endDate', { endDate: data.endDate })
      .andWhere('leave.end_date >= :startDate', { startDate: data.startDate })
      .getOne();

    if (overlappingLeave) {
      throw new ConflictException(
        'Leave request overlaps with an existing pending or approved leave',
      );
    }

    const leave = this.leaveRepository.create({
      organizationId,
      employeeId: employee.id,
      leaveType: data.leaveType,
      startDate: data.startDate,
      endDate: data.endDate,
      reason: data.reason,
      status: LeaveStatus.PENDING,
      approvedByUserId: null,
      approvedAt: null,
      rejectionReason: null,
    });

    const savedLeave = await this.leaveRepository.save(leave);

    return {
      ...savedLeave,
      leaveDays: this.calculateLeaveDays(
        savedLeave.startDate,
        savedLeave.endDate,
      ),
    };
  }

  async update(
    organizationId: string,
    userId: string,
    leaveId: string,
    data: UpdateLeaveDto,
  ) {
    const leave = await this.leaveRepository.findOne({
      where: {
        id: leaveId,
        organizationId,
      },
      relations: {
        employee: true,
      },
    });

    if (!leave) {
      throw new NotFoundException('Leave request not found');
    }

    if (leave.employee.userId !== userId) {
      throw new ConflictException('You can only update your own leave request');
    }

    if (leave.status !== LeaveStatus.PENDING) {
      throw new ConflictException('Only pending leave requests can be updated');
    }

    const startDate = data.startDate ?? leave.startDate;
    const endDate = data.endDate ?? leave.endDate;

    if (startDate > endDate) {
      throw new ConflictException('Leave start date cannot be after end date');
    }

    const overlappingLeave = await this.leaveRepository
      .createQueryBuilder('leave')
      .where('leave.organization_id = :organizationId', { organizationId })
      .andWhere('leave.employee_id = :employeeId', {
        employeeId: leave.employeeId,
      })
      .andWhere('leave.id != :leaveId', { leaveId })
      .andWhere('leave.status IN (:...statuses)', {
        statuses: [LeaveStatus.PENDING, LeaveStatus.APPROVED],
      })
      .andWhere('leave.start_date <= :endDate', { endDate })
      .andWhere('leave.end_date >= :startDate', { startDate })
      .getOne();

    if (overlappingLeave) {
      throw new ConflictException(
        'Updated leave dates overlap with an existing pending or approved leave',
      );
    }

    leave.leaveType = data.leaveType ?? leave.leaveType;
    leave.startDate = startDate;
    leave.endDate = endDate;
    leave.reason = data.reason ?? leave.reason;

    const savedLeave = await this.leaveRepository.save(leave);

    return {
      ...savedLeave,
      leaveDays: this.calculateLeaveDays(
        savedLeave.startDate,
        savedLeave.endDate,
      ),
    };
  }

  async findAll(organizationId: string, userId: string, role: string) {
    const query = this.leaveRepository
      .createQueryBuilder('leave')
      .leftJoinAndSelect('leave.employee', 'employee')
      .where('leave.organization_id = :organizationId', {
        organizationId,
      });

    if (role === 'ADMIN' || role === 'HR') {
      return query.orderBy('leave.start_date', 'DESC').getMany();
    }

    if (role === 'MANAGER') {
      const employee = await this.employeesService.findByUserId(
        organizationId,
        userId,
      );

      if (!employee) {
        throw new NotFoundException('Employee profile not found for this user');
      }

      const subordinateIds =
        employee.subordinates?.map((subordinate) => subordinate.id) ?? [];

      const employeeIds = [employee.id, ...subordinateIds];

      query.andWhere('leave.employee_id IN (:...employeeIds)', { employeeIds });

      return query.orderBy('leave.start_date', 'DESC').getMany();
    }

    const employee = await this.employeesService.findByUserId(
      organizationId,
      userId,
    );

    if (!employee) {
      throw new NotFoundException('Employee profile not found for this user');
    }

    query.andWhere('leave.employee_id = :employeeId', {
      employeeId: employee.id,
    });

    return query.orderBy('leave.start_date', 'DESC').getMany();
  }

  async approve(
    organizationId: string,
    userId: string,
    role: string,
    leaveId: string,
  ) {
    const leave = await this.leaveRepository.findOne({
      where: {
        id: leaveId,
        organizationId,
      },
      relations: {
        employee: true,
      },
    });

    if (!leave) {
      throw new NotFoundException('Leave request not found');
    }

    if (leave.status !== LeaveStatus.PENDING) {
      throw new ConflictException(
        'Only pending leave requests can be approved',
      );
    }

    if (leave.employee.userId === userId) {
      throw new ConflictException('You cannot approve your own leave request');
    }

    if (role === 'MANAGER') {
      const manager = await this.employeesService.findByUserId(
        organizationId,
        userId,
      );

      if (!manager) {
        throw new NotFoundException('Employee profile not found for this user');
      }

      if (leave.employee.managerId !== manager.id) {
        throw new ConflictException(
          'You can only approve leave requests from your direct subordinates',
        );
      }
    }

    leave.status = LeaveStatus.APPROVED;
    leave.approvedByUserId = userId;
    leave.approvedAt = new Date();
    leave.rejectionReason = null;

    const savedLeave = await this.leaveRepository.save(leave);

    return {
      ...savedLeave,
      leaveDays: this.calculateLeaveDays(
        savedLeave.startDate,
        savedLeave.endDate,
      ),
    };
  }

  async reject(
    organizationId: string,
    userId: string,
    role: string,
    leaveId: string,
    rejectionReason: string,
  ) {
    const leave = await this.leaveRepository.findOne({
      where: {
        id: leaveId,
        organizationId,
      },
      relations: {
        employee: true,
      },
    });

    if (!leave) {
      throw new NotFoundException('Leave request not found');
    }

    if (leave.status !== LeaveStatus.PENDING) {
      throw new ConflictException(
        'Only pending leave requests can be rejected',
      );
    }

    if (leave.employee.userId === userId) {
      throw new ConflictException('You cannot reject your own leave request');
    }

    if (role === 'MANAGER') {
      const manager = await this.employeesService.findByUserId(
        organizationId,
        userId,
      );

      if (!manager) {
        throw new NotFoundException('Employee profile not found for this user');
      }

      if (leave.employee.managerId !== manager.id) {
        throw new ConflictException(
          'You can only reject leave requests from your direct subordinates',
        );
      }
    }

    leave.status = LeaveStatus.REJECTED;
    leave.approvedByUserId = null;
    leave.approvedAt = null;
    leave.rejectionReason = rejectionReason;

    const savedLeave = await this.leaveRepository.save(leave);

    return {
      ...savedLeave,
      leaveDays: this.calculateLeaveDays(
        savedLeave.startDate,
        savedLeave.endDate,
      ),
    };
  }

  async cancel(
    organizationId: string,
    userId: string,
    role: string,
    leaveId: string,
  ) {
    const leave = await this.leaveRepository.findOne({
      where: {
        id: leaveId,
        organizationId,
      },
      relations: {
        employee: true,
      },
    });

    if (!leave) {
      throw new NotFoundException('Leave request not found');
    }

    if (leave.status !== LeaveStatus.PENDING) {
      throw new ConflictException(
        'Only pending leave requests can be cancelled',
      );
    }

    const isOwner = leave.employee.userId === userId;

    if (isOwner) {
      leave.status = LeaveStatus.CANCELLED;
      return this.leaveRepository.save(leave);
    }

    if (role === 'HR' || role === 'ADMIN') {
      leave.status = LeaveStatus.CANCELLED;
      return this.leaveRepository.save(leave);
    }

    throw new ConflictException(
      'You are not allowed to cancel this leave request',
    );
  }
}
