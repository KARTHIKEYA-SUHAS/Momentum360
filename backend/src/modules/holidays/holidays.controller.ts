import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { HolidaysService } from './holidays.service.js';
import { CreateHolidayDto } from './dto/create-holiday.dto.js';
import { UpdateHolidayDto } from './dto/update-holiday.dto.js';

import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator.js';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';

import { UserRole } from '../users/entities/user.entity.js';

import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth('access-token')
@Controller('holidays')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HolidaysController {
  constructor(private readonly holidaysService: HolidaysService) {}

  @Post()
  @Roles(UserRole.HR, UserRole.ADMIN)
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() createHolidayDto: CreateHolidayDto,
  ) {
    return this.holidaysService.create(user.organizationId, createHolidayDto);
  }

  @Get()
  @Roles(UserRole.EMPLOYEE, UserRole.MANAGER, UserRole.HR, UserRole.ADMIN)
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.holidaysService.findAll(user.organizationId);
  }

  @Get(':id')
  @Roles(UserRole.EMPLOYEE, UserRole.MANAGER, UserRole.HR, UserRole.ADMIN)
  findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') holidayId: string,
  ) {
    return this.holidaysService.findOne(user.organizationId, holidayId);
  }

  @Patch(':id')
  @Roles(UserRole.HR, UserRole.ADMIN)
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') holidayId: string,
    @Body() updateHolidayDto: UpdateHolidayDto,
  ) {
    return this.holidaysService.update(
      user.organizationId,
      holidayId,
      updateHolidayDto,
    );
  }

  @Patch(':id/activate')
  @Roles(UserRole.HR, UserRole.ADMIN)
  activate(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') holidayId: string,
  ) {
    return this.holidaysService.activate(user.organizationId, holidayId);
  }

  @Patch(':id/deactivate')
  @Roles(UserRole.HR, UserRole.ADMIN)
  deactivate(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') holidayId: string,
  ) {
    return this.holidaysService.deactivate(user.organizationId, holidayId);
  }
}
