import { Controller, Get, UseGuards } from '@nestjs/common';

import { DashboardService } from './dashboard.service.js';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

import { UserRole } from '../users/entities/user.entity.js';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator.js';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  getDashboard(@CurrentUser() user: AuthenticatedUser) {
    return this.dashboardService.getDashboard(
      user.organizationId,
      user.userId,
      user.role as UserRole,
    );
  }
}
