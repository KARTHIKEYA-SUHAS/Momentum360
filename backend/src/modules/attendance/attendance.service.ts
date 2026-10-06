import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Attendance, AttendanceStatus } from './entities/attendance.entity.js';

import { Employee } from '../employees/entities/employee.entity.js';

import { CreateAttendanceDto } from './dto/create-attendance.dto.js';
import { UpdateAttendanceDto } from './dto/update-attendance.dto.js';

import { EmployeesService } from '../employees/employees.service.js';
import { UserRole } from '../users/entities/user.entity.js';

import { Holiday } from '../holidays/entities/holiday.entity.js';
// import { HolidaysModule } from '../holidays/holidays.module.js';

import { WorkLocationService } from '../work-location/work-location.service.js';
import { CheckInDto } from './dto/check-in.dto.js';
import { WorkMode } from '../work-location/entities/team-work-location-assignment.entity.js';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,

    @InjectRepository(Employee)
    private readonly employeesRepository: Repository<Employee>,

    @InjectRepository(Holiday)
    private readonly holidaysRepository: Repository<Holiday>,

    private readonly employeesService: EmployeesService,

    private readonly workLocationService: WorkLocationService,
  ) {}

  async create(
    organizationId: string,
    markedByUserId: string,
    data: CreateAttendanceDto,
  ) {
    const employee = await this.employeesRepository.findOne({
      where: {
        id: data.employeeId,
        organizationId,
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    if (!employee.isActive) {
      throw new ConflictException(
        'Cannot create attendance for an inactive employee',
      );
    }

    const existingAttendance = await this.attendanceRepository.findOne({
      where: {
        employeeId: data.employeeId,
        attendanceDate: data.attendanceDate,
      },
    });

    if (existingAttendance) {
      throw new ConflictException(
        'Attendance already exists for this employee and date',
      );
    }

    const checkIn = data.checkIn ? new Date(data.checkIn) : null;

    const checkOut = data.checkOut ? new Date(data.checkOut) : null;

    this.validateAttendanceData(data.status, checkIn, checkOut);

    const attendance = this.attendanceRepository.create({
      organizationId,
      employeeId: data.employeeId,
      attendanceDate: data.attendanceDate,
      status: data.status,
      checkIn,
      checkOut,
      markedByUserId,
    });

    const savedAttendance = await this.attendanceRepository.save(attendance);

    return this.findOne(
      organizationId,
      savedAttendance.id,
      markedByUserId,
      UserRole.ADMIN,
    );
  }

  async checkIn(organizationId: string, userId: string, data: CheckInDto) {
    const employee = await this.employeesService.findByUserId(
      organizationId,
      userId,
    );

    if (!employee) {
      throw new NotFoundException('Employee profile not found for this user');
    }

    if (!employee.isActive || employee.status === 'TERMINATED') {
      throw new ConflictException(
        'Inactive or terminated employees cannot check in',
      );
    }

    const today = new Date().toISOString().split('T')[0];

    const effectiveWorkLocation =
      await this.workLocationService.getEffectiveWorkLocation(
        organizationId,
        employee.id,
        today,
      );

    if (effectiveWorkLocation.workMode === WorkMode.OFFICE) {
      if (data.latitude === undefined || data.longitude === undefined) {
        throw new ConflictException(
          'GPS location is required for office check-in',
        );
      }

      if (!effectiveWorkLocation.officeLocation) {
        throw new ConflictException(
          'Office location is not configured for this employee',
        );
      }

      const distance = this.calculateDistanceInMeters(
        data.latitude,
        data.longitude,
        Number(effectiveWorkLocation.officeLocation.latitude),
        Number(effectiveWorkLocation.officeLocation.longitude),
      );

      if (distance > effectiveWorkLocation.officeLocation.radiusMeters) {
        throw new ConflictException(
          'You are outside the allowed office location',
        );
      }
    }

    const isHoliday = await this.isActiveHoliday(organizationId, today);

    if (isHoliday) {
      throw new ConflictException(
        'Check-in is not allowed on an active holiday',
      );
    }

    const existingAttendance = await this.attendanceRepository.findOne({
      where: {
        employeeId: employee.id,
        attendanceDate: today,
      },
    });

    if (existingAttendance) {
      throw new ConflictException('Attendance already exists for today');
    }

    const attendance = this.attendanceRepository.create({
      organizationId,
      employeeId: employee.id,
      attendanceDate: today,
      status: AttendanceStatus.PRESENT,
      checkIn: new Date(),
      checkOut: null,
      workMode: effectiveWorkLocation.workMode,
      checkInLatitude: data.latitude ?? null,
      checkInLongitude: data.longitude ?? null,
      markedByUserId: userId,
    });

    const savedAttendance = await this.attendanceRepository.save(attendance);

    return this.findOne(
      organizationId,
      savedAttendance.id,
      userId,
      UserRole.EMPLOYEE,
    );
  }

  async checkOut(organizationId: string, userId: string) {
    const employee = await this.employeesService.findByUserId(
      organizationId,
      userId,
    );

    if (!employee) {
      throw new NotFoundException('Employee profile not found for this user');
    }

    const today = new Date().toISOString().split('T')[0];

    const attendance = await this.attendanceRepository.findOne({
      where: {
        organizationId,
        employeeId: employee.id,
        attendanceDate: today,
      },
    });

    if (!attendance) {
      throw new NotFoundException(
        'No attendance record found for today. Please check in first',
      );
    }

    if (!attendance.checkIn) {
      throw new ConflictException('Cannot check out before checking in');
    }

    if (attendance.checkOut) {
      throw new ConflictException('You have already checked out for today');
    }

    attendance.checkOut = new Date();

    const updatedAttendance = await this.attendanceRepository.save(attendance);

    return this.findOne(
      organizationId,
      updatedAttendance.id,
      userId,
      UserRole.EMPLOYEE,
    );
  }

  async findAll(organizationId: string, userId: string, role: UserRole) {
    if (role === UserRole.ADMIN || role === UserRole.HR) {
      return this.attendanceRepository.find({
        where: {
          organizationId,
        },
        relations: {
          employee: true,
        },
        order: {
          attendanceDate: 'DESC',
        },
      });
    }

    const employee = await this.employeesService.findByUserId(
      organizationId,
      userId,
    );

    if (!employee) {
      throw new NotFoundException('Employee profile not found for this user');
    }

    if (role === UserRole.EMPLOYEE) {
      return this.attendanceRepository.find({
        where: {
          organizationId,
          employeeId: employee.id,
        },
        relations: {
          employee: true,
        },
        order: {
          attendanceDate: 'DESC',
        },
      });
    }

    const subordinates = await this.employeesRepository.find({
      where: {
        organizationId,
        managerId: employee.id,
        isActive: true,
      },
    });

    const employeeIds = subordinates.map((subordinate) => subordinate.id);

    employeeIds.push(employee.id);

    return this.attendanceRepository
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.employee', 'employee')
      .where('attendance.organization_id = :organizationId', { organizationId })
      .andWhere('attendance.employee_id IN (:...employeeIds)', { employeeIds })
      .orderBy('attendance.attendance_date', 'DESC')
      .getMany();
  }

  async findOne(
    organizationId: string,
    id: string,
    userId: string,
    role: UserRole,
  ) {
    const attendance = await this.attendanceRepository.findOne({
      where: {
        id,
        organizationId,
      },
      relations: {
        employee: true,
      },
    });

    if (!attendance) {
      throw new NotFoundException('Attendance record not found');
    }

    if (role === UserRole.ADMIN || role === UserRole.HR) {
      return attendance;
    }

    const employee = await this.employeesService.findByUserId(
      organizationId,
      userId,
    );

    if (!employee) {
      throw new NotFoundException('Employee profile not found for this user');
    }

    if (role === UserRole.EMPLOYEE) {
      if (attendance.employeeId !== employee.id) {
        throw new NotFoundException('Attendance record not found');
      }

      return attendance;
    }

    if (attendance.employeeId !== employee.id) {
      const targetEmployee = await this.employeesRepository.findOne({
        where: {
          id: attendance.employeeId,
          organizationId,
        },
      });

      if (!targetEmployee || targetEmployee.managerId !== employee.id) {
        throw new NotFoundException('Attendance record not found');
      }
    }

    return attendance;
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
    });
  }

  async update(organizationId: string, id: string, data: UpdateAttendanceDto) {
    const attendance = await this.attendanceRepository.findOne({
      where: {
        id,
        organizationId,
      },
    });

    if (!attendance) {
      throw new NotFoundException('Attendance record not found');
    }

    if (
      data.attendanceDate &&
      data.attendanceDate !== attendance.attendanceDate
    ) {
      const existingAttendance = await this.attendanceRepository.findOne({
        where: {
          employeeId: attendance.employeeId,
          attendanceDate: data.attendanceDate,
        },
      });

      if (existingAttendance && existingAttendance.id !== attendance.id) {
        throw new ConflictException(
          'Attendance already exists for this employee and date',
        );
      }

      attendance.attendanceDate = data.attendanceDate;
    }

    if (data.status) {
      attendance.status = data.status;
    }

    const checkIn =
      data.checkIn !== undefined ? new Date(data.checkIn) : attendance.checkIn;

    const checkOut =
      data.checkOut !== undefined
        ? new Date(data.checkOut)
        : attendance.checkOut;

    this.validateAttendanceData(attendance.status, checkIn, checkOut);

    if (data.checkIn !== undefined) {
      attendance.checkIn = new Date(data.checkIn);
    }

    if (data.checkOut !== undefined) {
      attendance.checkOut = new Date(data.checkOut);
    }

    const updatedAttendance = await this.attendanceRepository.save(attendance);

    return this.findOne(
      organizationId,
      updatedAttendance.id,
      '',
      UserRole.ADMIN,
    );
  }

  private validateAttendanceData(
    status: AttendanceStatus,
    checkIn?: Date | null,
    checkOut?: Date | null,
  ) {
    const hasCheckIn = !!checkIn;
    const hasCheckOut = !!checkOut;

    if (
      status === AttendanceStatus.ABSENT ||
      status === AttendanceStatus.ON_LEAVE ||
      status === AttendanceStatus.HOLIDAY
    ) {
      if (hasCheckIn || hasCheckOut) {
        throw new ConflictException(
          `${status} attendance cannot have check-in or check-out times`,
        );
      }

      return;
    }

    if (!hasCheckIn && hasCheckOut) {
      throw new ConflictException('Check-in is required before check-out');
    }

    if (hasCheckIn && hasCheckOut) {
      const checkInTime = checkIn.getTime();
      const checkOutTime = checkOut.getTime();

      if (Number.isNaN(checkInTime) || Number.isNaN(checkOutTime)) {
        throw new ConflictException('Invalid check-in or check-out time');
      }

      if (checkOutTime < checkInTime) {
        throw new ConflictException(
          'Check-out cannot be earlier than check-in',
        );
      }
    }
  }

  private async isActiveHoliday(
    organizationId: string,
    attendanceDate: string,
  ): Promise<boolean> {
    const holiday = await this.holidaysRepository.findOne({
      where: {
        organizationId,
        date: attendanceDate,
        isActive: true,
      },
    });

    return !!holiday;
  }

  private calculateDistanceInMeters(
    latitude1: number,
    longitude1: number,
    latitude2: number,
    longitude2: number,
  ): number {
    const earthRadius = 6371000;

    const lat1 = (latitude1 * Math.PI) / 180;
    const lat2 = (latitude2 * Math.PI) / 180;

    const deltaLatitude = ((latitude2 - latitude1) * Math.PI) / 180;

    const deltaLongitude = ((longitude2 - longitude1) * Math.PI) / 180;

    const a =
      Math.sin(deltaLatitude / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLongitude / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadius * c;
  }
}
