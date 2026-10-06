import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { AttendanceService } from './attendance.service.js';
import { CreateAttendanceDto } from './dto/create-attendance.dto.js';
import { UpdateAttendanceDto } from './dto/update-attendance.dto.js';
import { CheckInDto } from './dto/check-in.dto.js';

import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator.js';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';

import { UserRole } from '../users/entities/user.entity.js';

import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth('access-token')
@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.HR)
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() createAttendanceDto: CreateAttendanceDto,
  ) {
    return this.attendanceService.create(
      user.organizationId,
      user.userId,
      createAttendanceDto,
    );
  }

  @Post('check-in')
  @Roles(UserRole.EMPLOYEE, UserRole.MANAGER)
  checkIn(
    @CurrentUser() user: AuthenticatedUser,
    @Body() checkInDto: CheckInDto,
  ) {
    return this.attendanceService.checkIn(
      user.organizationId,
      user.userId,
      checkInDto,
    );
  }

  @Post('check-out')
  @Roles(UserRole.EMPLOYEE, UserRole.MANAGER)
  checkOut(@CurrentUser() user: AuthenticatedUser) {
    return this.attendanceService.checkOut(user.organizationId, user.userId);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.MANAGER, UserRole.EMPLOYEE)
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.attendanceService.findAll(
      user.organizationId,
      user.userId,
      user.role as UserRole,
    );
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.MANAGER, UserRole.EMPLOYEE)
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.attendanceService.findOne(
      user.organizationId,
      id,
      user.userId,
      user.role as UserRole,
    );
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.HR)
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() updateAttendanceDto: UpdateAttendanceDto,
  ) {
    return this.attendanceService.update(
      user.organizationId,
      id,
      updateAttendanceDto,
    );
  }
}
