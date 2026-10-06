import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';

import { WorkLocationService } from './work-location.service.js';
import { CreateOfficeLocationDto } from './dto/create-office-location.dto.js';
import { UpdateOfficeLocationDto } from './dto/update-office-location.dto.js';

import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator.js';
import { UserRole } from '../users/entities/user.entity.js';

import { CreateTeamWorkLocationAssignmentDto } from './dto/create-team-work-location-assignment.dto.js';
import { CreateEmployeeWorkLocationOverrideDto } from './dto/create-employee-work-location-override.dto.js';
import { UpdateEmployeeWorkLocationOverrideDto } from './dto/update-employee-work-location-override.dto.js';

@ApiTags('Work Location')
@ApiBearerAuth('access-token')
@Controller('work-locations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WorkLocationController {
  constructor(private readonly workLocationService: WorkLocationService) {}

  @Post('offices')
  @Roles(UserRole.ADMIN, UserRole.HR)
  createOffice(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateOfficeLocationDto,
  ) {
    return this.workLocationService.create(user.organizationId, dto);
  }

  @Get('offices')
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.MANAGER, UserRole.EMPLOYEE)
  findAllOffices(@CurrentUser() user: AuthenticatedUser) {
    return this.workLocationService.findAll(user.organizationId);
  }

  @Get('offices/:id')
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.MANAGER, UserRole.EMPLOYEE)
  findOneOffice(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.workLocationService.findOne(user.organizationId, id);
  }

  @Patch('offices/:id')
  @Roles(UserRole.ADMIN, UserRole.HR)
  updateOffice(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateOfficeLocationDto,
  ) {
    return this.workLocationService.update(user.organizationId, id, dto);
  }

  @Patch('offices/:id/deactivate')
  @Roles(UserRole.ADMIN, UserRole.HR)
  deactivateOffice(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.workLocationService.deactivate(user.organizationId, id);
  }

  @Patch('offices/:id/activate')
  @Roles(UserRole.ADMIN, UserRole.HR)
  activateOffice(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.workLocationService.activate(user.organizationId, id);
  }

  @Post('teams/:managerId')
  @Roles(UserRole.ADMIN, UserRole.HR)
  async createTeamAssignment(
    @Param('managerId') managerId: string,
    @Body() dto: CreateTeamWorkLocationAssignmentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.workLocationService.createTeamAssignment(
      user.organizationId,
      managerId,
      dto,
    );
  }

  @Get('teams/:managerId')
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.MANAGER)
  async getTeamAssignment(
    @Param('managerId') managerId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.workLocationService.findTeamAssignment(
      user.organizationId,
      managerId,
    );
  }

  @Patch('teams/:managerId')
  @Roles(UserRole.ADMIN, UserRole.HR)
  async updateTeamAssignment(
    @Param('managerId') managerId: string,
    @Body() dto: CreateTeamWorkLocationAssignmentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.workLocationService.updateTeamAssignment(
      user.organizationId,
      managerId,
      dto,
    );
  }

  @Patch('teams/:managerId/deactivate')
  @Roles(UserRole.ADMIN, UserRole.HR)
  async deactivateTeamAssignment(
    @Param('managerId') managerId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.workLocationService.deactivateTeamAssignment(
      user.organizationId,
      managerId,
    );
  }

  @Post('employees/:employeeId/overrides')
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.MANAGER)
  async createEmployeeOverride(
    @Param('employeeId') employeeId: string,
    @Body() dto: CreateEmployeeWorkLocationOverrideDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.workLocationService.createEmployeeOverride(
      user.organizationId,
      user.userId,
      user.role as UserRole,
      employeeId,
      dto,
    );
  }

  @Get('employees/:employeeId/effective')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.MANAGER, UserRole.EMPLOYEE)
  async getEffectiveWorkLocation(
    @CurrentUser() user: AuthenticatedUser,
    @Param('employeeId') employeeId: string,
    @Query('date') date?: string,
  ) {
    return this.workLocationService.getEffectiveWorkLocation(
      user.organizationId,
      employeeId,
      date,
    );
  }

  @Patch('teams/:managerId/activate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.HR)
  async activateTeamAssignment(
    @CurrentUser() user: AuthenticatedUser,
    @Param('managerId') managerId: string,
  ) {
    return this.workLocationService.activateTeamAssignment(
      user.organizationId,
      managerId,
    );
  }

  @Get('employees/:employeeId/overrides')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.MANAGER, UserRole.EMPLOYEE)
  async findEmployeeOverrides(
    @CurrentUser() user: AuthenticatedUser,
    @Param('employeeId') employeeId: string,
  ) {
    return this.workLocationService.findEmployeeOverrides(
      user.organizationId,
      employeeId,
    );
  }

  @Patch('employees/overrides/:overrideId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.MANAGER)
  async updateEmployeeOverride(
    @CurrentUser() user: AuthenticatedUser,
    @Param('overrideId') overrideId: string,
    @Body() dto: UpdateEmployeeWorkLocationOverrideDto,
  ) {
    return this.workLocationService.updateEmployeeOverride(
      user.organizationId,
      user.userId,
      user.role as UserRole,
      overrideId,
      dto,
    );
  }

  @Patch('employees/overrides/:overrideId/deactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.MANAGER)
  async deactivateEmployeeOverride(
    @CurrentUser() user: AuthenticatedUser,
    @Param('overrideId') overrideId: string,
  ) {
    return this.workLocationService.deactivateEmployeeOverride(
      user.organizationId,
      user.userId,
      user.role as UserRole,
      overrideId,
    );
  }

  @Patch('employees/overrides/:overrideId/activate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.MANAGER)
  async activateEmployeeOverride(
    @CurrentUser() user: AuthenticatedUser,
    @Param('overrideId') overrideId: string,
  ) {
    return this.workLocationService.activateEmployeeOverride(
      user.organizationId,
      user.userId,
      user.role as UserRole,
      overrideId,
    );
  }
}
