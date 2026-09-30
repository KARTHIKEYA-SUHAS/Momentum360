import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Holiday } from './entities/holiday.entity.js';
import { CreateHolidayDto } from './dto/create-holiday.dto.js';
import { UpdateHolidayDto } from './dto/update-holiday.dto.js';

@Injectable()
export class HolidaysService {
  constructor(
    @InjectRepository(Holiday)
    private readonly holidaysRepository: Repository<Holiday>,
  ) {}

  async create(organizationId: string, data: CreateHolidayDto) {
    const existingHoliday = await this.holidaysRepository.findOne({
      where: {
        organizationId,
        date: data.date,
        name: data.name,
      },
    });

    if (existingHoliday) {
      throw new ConflictException(
        'A holiday with the same name already exists on this date',
      );
    }

    const holiday = this.holidaysRepository.create({
      organizationId,
      name: data.name,
      date: data.date,
      description: data.description ?? null,
      isOptional: data.isOptional ?? false,
      isActive: true,
    });

    return this.holidaysRepository.save(holiday);
  }

  async findAll(organizationId: string) {
    return this.holidaysRepository.find({
      where: {
        organizationId,
      },
      order: {
        date: 'ASC',
      },
    });
  }

  async findOne(organizationId: string, holidayId: string) {
    const holiday = await this.holidaysRepository.findOne({
      where: {
        id: holidayId,
        organizationId,
      },
    });

    if (!holiday) {
      throw new NotFoundException('Holiday not found');
    }

    return holiday;
  }

  async update(
    organizationId: string,
    holidayId: string,
    data: UpdateHolidayDto,
  ) {
    const holiday = await this.findOne(organizationId, holidayId);

    const name = data.name ?? holiday.name;
    const date = data.date ?? holiday.date;

    const duplicate = await this.holidaysRepository
      .createQueryBuilder('holiday')
      .where('holiday.organization_id = :organizationId', { organizationId })
      .andWhere('holiday.name = :name', { name })
      .andWhere('holiday.date = :date', { date })
      .andWhere('holiday.id != :holidayId', { holidayId })
      .getOne();

    if (duplicate) {
      throw new ConflictException(
        'A holiday with the same name already exists on this date',
      );
    }

    holiday.name = name;
    holiday.date = date;
    holiday.description = data.description ?? holiday.description;
    holiday.isOptional = data.isOptional ?? holiday.isOptional;

    return this.holidaysRepository.save(holiday);
  }

  async activate(organizationId: string, holidayId: string) {
    const holiday = await this.findOne(organizationId, holidayId);

    if (holiday.isActive) {
      throw new ConflictException('Holiday is already active');
    }

    holiday.isActive = true;

    return this.holidaysRepository.save(holiday);
  }

  async deactivate(organizationId: string, holidayId: string) {
    const holiday = await this.findOne(organizationId, holidayId);

    if (!holiday.isActive) {
      throw new ConflictException('Holiday is already inactive');
    }

    holiday.isActive = false;

    return this.holidaysRepository.save(holiday);
  }
}
