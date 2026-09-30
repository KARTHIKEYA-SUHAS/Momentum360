import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

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

import { DepartmentsService } from './departments.service.js';
import { CreateDepartmentDto } from './dto/create-department.dto.js';
import { UpdateDepartmentDto } from './dto/update-department.dto.js';

@ApiTags('Departments')
@ApiBearerAuth('access-token')
@Controller('departments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @ApiOperation({ summary: 'Create Department'})
  @ApiResponse({
    status: 200,
    description: 'Department Created Successfully'
  })
  @ApiResponse({
    status: 409,
    description: 'Department already exists'
  })
  @Post()
  @Roles(UserRole.ADMIN, UserRole.HR)
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() createDepartmentDto: CreateDepartmentDto,
  ) {
    return this.departmentsService.create(
      user.organizationId,
      createDepartmentDto,
    );
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.MANAGER, UserRole.EMPLOYEE)
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.departmentsService.findAll(user.organizationId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.MANAGER, UserRole.EMPLOYEE)
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.departmentsService.findOne(user.organizationId, id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.HR)
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ) {
    return this.departmentsService.update(
      user.organizationId,
      id,
      updateDepartmentDto,
    );
  }

  @Patch(':id/deactivate')
  @Roles(UserRole.ADMIN, UserRole.HR)
  deactivate(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.departmentsService.deactivate(user.organizationId, id);
  }

  @Patch(':id/activate')
  @Roles(UserRole.ADMIN, UserRole.HR)
  activate(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.departmentsService.activate(user.organizationId, id);
  }
}
