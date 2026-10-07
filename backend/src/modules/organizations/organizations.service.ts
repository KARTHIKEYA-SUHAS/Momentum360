import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Organization } from './entities/organization.entity.js';

@Injectable()
export class OrganizationsService implements OnModuleInit {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationsRepository: Repository<Organization>,

    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    const name = this.configService.get<string>('INITIAL_ORG_NAME');
    const code = this.configService.get<string>('INITIAL_ORG_CODE');

    if (!name || !code) {
      return;
    }

    const existingOrganization = await this.organizationsRepository.findOne({
      where: { code },
    });

    if (existingOrganization) {
      return;
    }

    await this.organizationsRepository.save({
      name,
      code,
      isActive: true,
    });

    console.log(`Initial organization created: ${name} (${code})`);
  }
}
