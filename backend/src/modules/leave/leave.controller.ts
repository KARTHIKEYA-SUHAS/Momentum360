import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { LeaveService } from './leave.service.js';
import { CreateLeaveDto } from './dto/create-leave.dto.js';
import { UpdateLeaveDto } from './dto/update-leave.dto.js';
import { RejectLeaveDto } from './dto/reject-leave.dto.js';

import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator.js';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';

import { UserRole } from '../users/entities/user.entity.js';

import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth('access-token')
@Controller('leaves')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Post()
  @Roles(UserRole.EMPLOYEE, UserRole.MANAGER, UserRole.HR, UserRole.ADMIN)
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() createLeaveDto: CreateLeaveDto,
  ) {
    return this.leaveService.create(
      user.organizationId,
      user.userId,
      createLeaveDto,
    );
  }

  @Get()
  @Roles(UserRole.EMPLOYEE, UserRole.MANAGER, UserRole.HR, UserRole.ADMIN)
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.leaveService.findAll(
      user.organizationId,
      user.userId,
      user.role,
    );
  }

  @Patch(':id/approve')
  @Roles(UserRole.MANAGER, UserRole.HR, UserRole.ADMIN)
  approve(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') leaveId: string,
  ) {
    return this.leaveService.approve(
      user.organizationId,
      user.userId,
      user.role,
      leaveId,
    );
  }

  @Patch(':id/reject')
  @Roles(UserRole.MANAGER, UserRole.HR, UserRole.ADMIN)
  reject(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') leaveId: string,
    @Body() rejectLeaveDto: RejectLeaveDto,
  ) {
    return this.leaveService.reject(
      user.organizationId,
      user.userId,
      user.role,
      leaveId,
      rejectLeaveDto.rejectionReason,
    );
  }

  @Patch(':id/cancel')
  @Roles(UserRole.EMPLOYEE, UserRole.MANAGER, UserRole.HR, UserRole.ADMIN)
  cancel(@CurrentUser() user: AuthenticatedUser, @Param('id') leaveId: string) {
    return this.leaveService.cancel(
      user.organizationId,
      user.userId,
      user.role,
      leaveId,
    );
  }

  @Patch(':id')
  @Roles(UserRole.EMPLOYEE, UserRole.MANAGER, UserRole.HR, UserRole.ADMIN)
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') leaveId: string,
    @Body() updateLeaveDto: UpdateLeaveDto,
  ) {
    return this.leaveService.update(
      user.organizationId,
      user.userId,
      leaveId,
      updateLeaveDto,
    );
  }
}
