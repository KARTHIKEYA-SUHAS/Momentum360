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

import { UserRole } from './entities/user.entity.js';
import { UsersService } from './users.service.js';

import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@Controller('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Create a user' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
  })
  @ApiResponse({
    status: 409,
    description: 'User already exists',
  })
  @Post()
  @Roles(UserRole.ADMIN, UserRole.HR)
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() createUserDto: CreateUserDto,
  ) {
    return this.usersService.create(
      user.organizationId,
      createUserDto.email,
      createUserDto.password,
      createUserDto.role,
    );
  }

  @ApiOperation({ summary: 'List users' })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
  })
  @Get()
  @Roles(UserRole.ADMIN, UserRole.HR)
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.findAll(user.organizationId);
  }

  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.HR)
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.usersService.findOne(user.organizationId, id);
  }

  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.HR)
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(
      user.organizationId,
      id,
      user.userId,
      updateUserDto,
    );
  }

  @ApiOperation({ summary: 'Deactivate user' })
  @Patch(':id/deactivate')
  @Roles(UserRole.ADMIN, UserRole.HR)
  deactivate(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.usersService.deactivate(user.organizationId, id, user.userId);
  }

  @ApiOperation({ summary: 'Activate user' })
  @Patch(':id/activate')
  @Roles(UserRole.ADMIN, UserRole.HR)
  activate(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.usersService.activate(user.organizationId, id);
  }
}
