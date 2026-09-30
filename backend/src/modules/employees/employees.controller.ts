import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator.js';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';

import { UserRole } from '../users/entities/user.entity.js';

import { EmployeesService } from './employees.service.js';
import { CreateEmployeeDto } from './dto/create-employee.dto.js';
import { UpdateEmployeeDto } from './dto/update-employee.dto.js';

import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth('access-token')
@Controller('employees')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.HR)
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() createEmployeeDto: CreateEmployeeDto,
  ) {
    return this.employeesService.create(user.organizationId, createEmployeeDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.MANAGER, UserRole.EMPLOYEE)
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.employeesService.findAll(user.organizationId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.MANAGER, UserRole.EMPLOYEE)
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.employeesService.findOne(user.organizationId, id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.HR)
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return this.employeesService.update(
      user.organizationId,
      id,
      updateEmployeeDto,
    );
  }

  @Patch(':id/deactivate')
  @Roles(UserRole.ADMIN, UserRole.HR)
  deactivate(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.employeesService.deactivate(user.organizationId, id);
  }

  @Patch(':id/activate')
  @Roles(UserRole.ADMIN, UserRole.HR)
  activate(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.employeesService.activate(user.organizationId, id);
  }
}
