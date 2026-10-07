import {
  ConflictException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { User, UserRole } from './entities/user.entity.js';

import { Organization } from '../organizations/entities/organization.entity.js';
@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(Organization)
    private readonly organizationsRepository: Repository<Organization>,

    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    const email = this.configService.get<string>('INITIAL_ADMIN_EMAIL');
    const password = this.configService.get<string>('INITIAL_ADMIN_PASSWORD');

    if (!email || !password) {
      return;
    }

    const existingAdmin = await this.usersRepository.findOne({
      where: {
        email,
        role: UserRole.ADMIN,
      },
    });

    if (existingAdmin) {
      return;
    }

    const organization = await this.organizationsRepository.findOne({
      where: {
        code: this.configService.get<string>('INITIAL_ORG_CODE'),
      },
    });

    if (!organization) {
      throw new NotFoundException(
        'Initial organization not found while creating initial ADMIN',
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const admin = this.usersRepository.create({
      organizationId: organization.id,
      email,
      passwordHash,
      role: UserRole.ADMIN,
      isActive: true,
    });

    await this.usersRepository.save(admin);

    console.log(`Initial ADMIN created: ${email}`);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email })
      .getOne();
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
    });
  }

  async create(
    organizationId: string,
    email: string,
    password: string,
    role: UserRole,
  ) {
    if (role === UserRole.SUPER_ADMIN) {
      throw new ConflictException(
        'SUPER_ADMIN accounts cannot be created through user management',
      );
    }

    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const organization = await this.organizationsRepository.findOne({
      where: {
        id: organizationId,
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = this.usersRepository.create({
      organizationId,
      email,
      passwordHash,
      role,
      isActive: true,
    });

    const savedUser = await this.usersRepository.save(user);

    return this.sanitizeUser(savedUser);
  }

  async findAll(organizationId: string) {
    const users = await this.usersRepository.find({
      where: {
        organizationId,
      },
      order: {
        email: 'ASC',
      },
    });

    return users.map((user) => this.sanitizeUser(user));
  }

  async findOne(organizationId: string, id: string) {
    const user = await this.usersRepository.findOne({
      where: {
        id,
        organizationId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.sanitizeUser(user);
  }

  async update(
    organizationId: string,
    id: string,
    currentUserId: string,
    data: {
      email?: string;
      role?: UserRole;
      password?: string;
    },
  ) {
    const user = await this.usersRepository.findOne({
      where: {
        id,
        organizationId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (data.role && id === currentUserId && data.role !== user.role) {
      throw new ConflictException('You cannot change your own role');
    }

    if (data.email && data.email !== user.email) {
      const existingUser = await this.usersRepository.findOne({
        where: {
          email: data.email,
        },
      });

      if (existingUser && existingUser.id !== user.id) {
        throw new ConflictException('User with this email already exists');
      }

      user.email = data.email;
    }

    if (data.role === UserRole.SUPER_ADMIN) {
      throw new ConflictException(
        'SUPER_ADMIN role cannot be assigned through user management',
      );
    }

    if (data.role) {
      user.role = data.role;
    }

    if (data.password) {
      user.passwordHash = await bcrypt.hash(data.password, 12);
    }

    const updatedUser = await this.usersRepository.save(user);

    return this.sanitizeUser(updatedUser);
  }

  async deactivate(organizationId: string, id: string, currentUserId: string) {
    if (id === currentUserId) {
      throw new ConflictException('You cannot deactivate your own account');
    }

    const user = await this.usersRepository.findOne({
      where: {
        id,
        organizationId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === UserRole.ADMIN && user.isActive) {
      const activeAdminCount = await this.usersRepository.count({
        where: {
          organizationId,
          role: UserRole.ADMIN,
          isActive: true,
        },
      });

      if (activeAdminCount <= 1) {
        throw new ConflictException(
          'The organization must have at least one active ADMIN',
        );
      }
    }

    user.isActive = false;

    const updatedUser = await this.usersRepository.save(user);

    return this.sanitizeUser(updatedUser);
  }

  async activate(organizationId: string, id: string) {
    const user = await this.usersRepository.findOne({
      where: {
        id,
        organizationId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const organization = await this.organizationsRepository.findOne({
      where: {
        id: organizationId,
        isActive: true,
      },
    });

    if (!organization) {
      throw new ConflictException(
        'Cannot activate user because the organization is inactive',
      );
    }

    user.isActive = true;

    const updatedUser = await this.usersRepository.save(user);

    return this.sanitizeUser(updatedUser);
  }

  private sanitizeUser(user: User) {
    return {
      id: user.id,
      organizationId: user.organizationId,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
