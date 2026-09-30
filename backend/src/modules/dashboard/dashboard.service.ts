import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  And,
  LessThan,
  LessThanOrEqual,
  MoreThan,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';

import {
  Attendance,
  AttendanceStatus,
} from '../attendance/entities/attendance.entity.js';

import { Employee } from '../employees/entities/employee.entity.js';

import { Leave, LeaveStatus } from '../leave/entities/leave.entity.js';

import { Holiday } from '../holidays/entities/holiday.entity.js';

import { UserRole } from '../users/entities/user.entity.js';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeesRepository: Repository<Employee>,

    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,

    @InjectRepository(Leave)
    private readonly leaveRepository: Repository<Leave>,

    @InjectRepository(Holiday)
    private readonly holidaysRepository: Repository<Holiday>,
  ) {}

  async getDashboard(organizationId: string, userId: string, role: UserRole) {
    switch (role) {
      case UserRole.EMPLOYEE:
        return this.getEmployeeDashboard(organizationId, userId);

      case UserRole.MANAGER:
        return this.getManagerDashboard(organizationId, userId);

      case UserRole.HR:
      case UserRole.ADMIN:
        return this.getOrganizationDashboard(organizationId);

      default:
        throw new Error('Unsupported dashboard role');
    }
  }

  private async getEmployeeDashboard(organizationId: string, userId: string) {
    const employee = await this.employeesRepository.findOne({
      where: {
        organizationId,
        userId,
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee profile not found for this user');
    }

    const today = this.getCurrentDate();

    const monthStart = this.getMonthStart(today);
    const nextMonthStart = this.getNextMonthStart(today);
    const monthEnd = this.getMonthEnd(today);

    const todayAttendance = await this.attendanceRepository.findOne({
      where: {
        organizationId,
        employeeId: employee.id,
        attendanceDate: today,
      },
    });

    const currentMonthAttendance = await this.attendanceRepository.find({
      where: {
        organizationId,
        employeeId: employee.id,
        attendanceDate: MoreThanOrEqual(monthStart),
      },
    });

    const currentMonthLeaves = await this.leaveRepository.find({
      where: {
        organizationId,
        employeeId: employee.id,
        status: LeaveStatus.APPROVED,
        startDate: LessThanOrEqual(monthEnd),
        endDate: MoreThanOrEqual(monthStart),
      },
    });

    const upcomingHolidays = await this.holidaysRepository.find({
      where: {
        organizationId,
        date: MoreThan(today),
        isActive: true,
      },
      order: {
        date: 'ASC',
      },
      take: 5,
    });

    const todayLeave = currentMonthLeaves.find(
      (leave) => leave.startDate <= today && leave.endDate >= today,
    );

    const todayHoliday = await this.holidaysRepository.findOne({
      where: {
        organizationId,
        date: today,
        isActive: true,
      },
    });

    const todayStatus =
      todayAttendance?.status ??
      (todayLeave
        ? AttendanceStatus.ON_LEAVE
        : todayHoliday
          ? AttendanceStatus.HOLIDAY
          : null);

    return {
      role: UserRole.EMPLOYEE,

      attendance: {
        today: {
          status: todayStatus,
          checkIn: todayAttendance?.checkIn ?? null,
          checkOut: todayAttendance?.checkOut ?? null,
        },

        currentMonth: {
          present: this.countAttendanceByStatus(
            currentMonthAttendance,
            AttendanceStatus.PRESENT,
          ),

          absent: this.countAttendanceByStatus(
            currentMonthAttendance,
            AttendanceStatus.ABSENT,
          ),

          halfDay: this.countAttendanceByStatus(
            currentMonthAttendance,
            AttendanceStatus.HALF_DAY,
          ),

          onLeave: this.calculateLeaveDays(
            currentMonthLeaves,
            monthStart,
            monthEnd,
          ),

          holidays: await this.countActiveHolidays(
            organizationId,
            monthStart,
            nextMonthStart,
          ),
        },
      },

      leave: {
        pending: await this.leaveRepository.count({
          where: {
            organizationId,
            employeeId: employee.id,
            status: LeaveStatus.PENDING,
          },
        }),

        approved: await this.leaveRepository.count({
          where: {
            organizationId,
            employeeId: employee.id,
            status: LeaveStatus.APPROVED,
          },
        }),

        rejected: await this.leaveRepository.count({
          where: {
            organizationId,
            employeeId: employee.id,
            status: LeaveStatus.REJECTED,
          },
        }),
      },

      upcomingHolidays,
    };
  }

  private async getManagerDashboard(organizationId: string, userId: string) {
    const manager = await this.employeesRepository.findOne({
      where: {
        organizationId,
        userId,
      },
    });

    if (!manager) {
      throw new NotFoundException('Employee profile not found for this user');
    }

    const subordinates = await this.employeesRepository.find({
      where: {
        organizationId,
        managerId: manager.id,
        isActive: true,
      },
    });

    const employeeIds = [
      manager.id,
      ...subordinates.map((employee) => employee.id),
    ];

    const today = this.getCurrentDate();

    const monthStart = this.getMonthStart(today);
    const nextMonthStart = this.getNextMonthStart(today);
    const monthEnd = this.getMonthEnd(today);

    /*
     * Manager's own attendance
     */
    const managerAttendance = await this.attendanceRepository.find({
      where: {
        organizationId,
        employeeId: manager.id,
        attendanceDate: MoreThanOrEqual(monthStart),
      },
    });

    const managerTodayAttendance = managerAttendance.find(
      (attendance) => attendance.attendanceDate === today,
    );

    /*
     * Manager's own approved leave
     */
    const managerLeaves = await this.leaveRepository.find({
      where: {
        organizationId,
        employeeId: manager.id,
        status: LeaveStatus.APPROVED,
        startDate: LessThanOrEqual(monthEnd),
        endDate: MoreThanOrEqual(monthStart),
      },
    });

    /*
     * Today's team attendance
     */
    const todayAttendance = await this.attendanceRepository.find({
      where: {
        organizationId,
        attendanceDate: today,
      },
    });

    const teamTodayAttendance = todayAttendance.filter((attendance) =>
      employeeIds.includes(attendance.employeeId),
    );

    /*
     * Employees currently on approved leave
     */
    const teamLeaves = await this.leaveRepository.find({
      where: {
        organizationId,
        status: LeaveStatus.APPROVED,
        startDate: LessThanOrEqual(today),
        endDate: MoreThanOrEqual(today),
      },
    });

    const teamLeaveEmployeeIds = new Set(
      teamLeaves
        .filter((leave) => employeeIds.includes(leave.employeeId))
        .map((leave) => leave.employeeId),
    );

    /*
     * Pending leave requests from direct
     * subordinates.
     */
    const pendingLeaves = await this.leaveRepository.find({
      where: {
        organizationId,
        status: LeaveStatus.PENDING,
      },
    });

    const pendingLeaveRequests = pendingLeaves.filter((leave) =>
      subordinates.some((employee) => employee.id === leave.employeeId),
    ).length;

    /*
     * Upcoming holidays
     */
    const upcomingHolidays = await this.holidaysRepository.find({
      where: {
        organizationId,
        date: MoreThan(today),
        isActive: true,
      },
      order: {
        date: 'ASC',
      },
      take: 5,
    });

    const managerTodayLeave = managerLeaves.find(
      (leave) => leave.startDate <= today && leave.endDate >= today,
    );

    const managerTodayHoliday = await this.holidaysRepository.findOne({
      where: {
        organizationId,
        date: today,
        isActive: true,
      },
    });

    const managerTodayStatus =
      managerTodayAttendance?.status ??
      (managerTodayLeave
        ? AttendanceStatus.ON_LEAVE
        : managerTodayHoliday
          ? AttendanceStatus.HOLIDAY
          : null);

    return {
      role: UserRole.MANAGER,

      attendance: {
        today: {
          status: managerTodayStatus,
          checkIn: managerTodayAttendance?.checkIn ?? null,
          checkOut: managerTodayAttendance?.checkOut ?? null,
        },

        currentMonth: {
          present: this.countAttendanceByStatus(
            managerAttendance,
            AttendanceStatus.PRESENT,
          ),

          absent: this.countAttendanceByStatus(
            managerAttendance,
            AttendanceStatus.ABSENT,
          ),

          halfDay: this.countAttendanceByStatus(
            managerAttendance,
            AttendanceStatus.HALF_DAY,
          ),

          onLeave: this.calculateLeaveDays(managerLeaves, monthStart, monthEnd),

          holidays: await this.countActiveHolidays(
            organizationId,
            monthStart,
            nextMonthStart,
          ),
        },
      },

      leave: {
        pending: await this.leaveRepository.count({
          where: {
            organizationId,
            employeeId: manager.id,
            status: LeaveStatus.PENDING,
          },
        }),

        approved: await this.leaveRepository.count({
          where: {
            organizationId,
            employeeId: manager.id,
            status: LeaveStatus.APPROVED,
          },
        }),

        rejected: await this.leaveRepository.count({
          where: {
            organizationId,
            employeeId: manager.id,
            status: LeaveStatus.REJECTED,
          },
        }),
      },

      team: {
        total: subordinates.length,

        presentToday: teamTodayAttendance.filter(
          (attendance) => attendance.status === AttendanceStatus.PRESENT,
        ).length,

        absentToday: teamTodayAttendance.filter(
          (attendance) => attendance.status === AttendanceStatus.ABSENT,
        ).length,

        onLeaveToday: teamLeaveEmployeeIds.size,

        pendingLeaveRequests,
      },

      upcomingHolidays,
    };
  }

  private async getOrganizationDashboard(organizationId: string) {
    const today = this.getCurrentDate();

    const monthStart = this.getMonthStart(today);
    const nextMonthStart = this.getNextMonthStart(today);
    const monthEnd = this.getMonthEnd(today);

    /*
     * Employee statistics
     */
    const employees = await this.employeesRepository.find({
      where: {
        organizationId,
      },
    });

    const totalEmployees = employees.length;

    const activeEmployees = employees.filter(
      (employee) => employee.status === 'ACTIVE' && employee.isActive,
    ).length;

    const inactiveEmployees = employees.filter(
      (employee) => employee.status === 'INACTIVE' || !employee.isActive,
    ).length;

    const onLeaveEmployees = employees.filter(
      (employee) => employee.status === 'ON_LEAVE',
    ).length;

    const terminatedEmployees = employees.filter(
      (employee) => employee.status === 'TERMINATED',
    ).length;

    /*
     * Today's attendance
     */
    const todayAttendance = await this.attendanceRepository.find({
      where: {
        organizationId,
        attendanceDate: today,
      },
    });

    /*
     * Current month attendance
     */
    const currentMonthAttendance = await this.attendanceRepository.find({
      where: {
        organizationId,
        attendanceDate: MoreThanOrEqual(monthStart),
      },
    });

    /*
     * Current month's active holidays
     */
    const currentMonthHolidayCount = await this.countActiveHolidays(
      organizationId,
      monthStart,
      nextMonthStart,
    );

    /*
     * Leave statistics
     */
    const pendingLeaves = await this.leaveRepository.count({
      where: {
        organizationId,
        status: LeaveStatus.PENDING,
      },
    });

    const approvedLeaves = await this.leaveRepository.count({
      where: {
        organizationId,
        status: LeaveStatus.APPROVED,
      },
    });

    const rejectedLeaves = await this.leaveRepository.count({
      where: {
        organizationId,
        status: LeaveStatus.REJECTED,
      },
    });

    const cancelledLeaves = await this.leaveRepository.count({
      where: {
        organizationId,
        status: LeaveStatus.CANCELLED,
      },
    });

    /*
     * Upcoming holidays
     */
    const upcomingHolidays = await this.holidaysRepository.find({
      where: {
        organizationId,
        date: MoreThan(today),
        isActive: true,
      },
      order: {
        date: 'ASC',
      },
      take: 5,
    });

    return {
      role: UserRole.ADMIN,

      employees: {
        total: totalEmployees,
        active: activeEmployees,
        inactive: inactiveEmployees,
        onLeave: onLeaveEmployees,
        terminated: terminatedEmployees,
      },

      attendance: {
        today: {
          present: this.countAttendanceByStatus(
            todayAttendance,
            AttendanceStatus.PRESENT,
          ),

          absent: this.countAttendanceByStatus(
            todayAttendance,
            AttendanceStatus.ABSENT,
          ),

          halfDay: this.countAttendanceByStatus(
            todayAttendance,
            AttendanceStatus.HALF_DAY,
          ),

          onLeave: this.countAttendanceByStatus(
            todayAttendance,
            AttendanceStatus.ON_LEAVE,
          ),

          holiday: this.countAttendanceByStatus(
            todayAttendance,
            AttendanceStatus.HOLIDAY,
          ),
        },

        currentMonth: {
          present: this.countAttendanceByStatus(
            currentMonthAttendance,
            AttendanceStatus.PRESENT,
          ),

          absent: this.countAttendanceByStatus(
            currentMonthAttendance,
            AttendanceStatus.ABSENT,
          ),

          halfDay: this.countAttendanceByStatus(
            currentMonthAttendance,
            AttendanceStatus.HALF_DAY,
          ),

          onLeave: this.countAttendanceByStatus(
            currentMonthAttendance,
            AttendanceStatus.ON_LEAVE,
          ),

          holidays: currentMonthHolidayCount,
        },
      },

      leave: {
        pending: pendingLeaves,
        approved: approvedLeaves,
        rejected: rejectedLeaves,
        cancelled: cancelledLeaves,
      },

      upcomingHolidays,
    };
  }

  private countAttendanceByStatus(
    attendance: Attendance[],
    status: AttendanceStatus,
  ): number {
    return attendance.filter((record) => record.status === status).length;
  }

  private calculateLeaveDays(
    leaves: Leave[],
    monthStart: string,
    monthEnd: string,
  ): number {
    let totalDays = 0;

    for (const leave of leaves) {
      const start = leave.startDate > monthStart ? leave.startDate : monthStart;

      const end = leave.endDate < monthEnd ? leave.endDate : monthEnd;

      const startDate = new Date(`${start}T00:00:00Z`);
      const endDate = new Date(`${end}T00:00:00Z`);

      const difference = endDate.getTime() - startDate.getTime();

      totalDays += Math.floor(difference / (1000 * 60 * 60 * 24)) + 1;
    }

    return totalDays;
  }

  private async countActiveHolidays(
    organizationId: string,
    monthStart: string,
    nextMonthStart: string,
  ): Promise<number> {
    return this.holidaysRepository.count({
      where: {
        organizationId,
        isActive: true,
        date: And(MoreThanOrEqual(monthStart), LessThan(nextMonthStart)),
      },
    });
  }

  private getCurrentDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  private getMonthStart(date: string): string {
    return `${date.substring(0, 7)}-01`;
  }

  private getNextMonthStart(date: string): string {
    const [year, month] = date.split('-').map(Number);

    const nextMonth = month === 12 ? 1 : month + 1;

    const nextYear = month === 12 ? year + 1 : year;

    return `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;
  }

  private getMonthEnd(date: string): string {
    const nextMonthStart = this.getNextMonthStart(date);

    const endDate = new Date(`${nextMonthStart}T00:00:00Z`);

    endDate.setUTCDate(endDate.getUTCDate() - 1);

    return endDate.toISOString().split('T')[0];
  }
}
