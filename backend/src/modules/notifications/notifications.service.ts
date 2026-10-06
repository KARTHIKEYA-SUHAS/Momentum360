import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Notification } from './entities/notification.entity.js';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationsRepository: Repository<Notification>,
  ) {}

  async create(
    organizationId: string,
    recipientUserId: string,
    type: string,
    title: string,
    message: string,
  ) {
    const notification = this.notificationsRepository.create({
      organizationId,
      recipientUserId,
      type,
      title,
      message,
      isRead: false,
      readAt: null,
    });

    return this.notificationsRepository.save(notification);
  }

  async findAllForUser(organizationId: string, recipientUserId: string) {
    return this.notificationsRepository.find({
      where: {
        organizationId,
        recipientUserId,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async markAsRead(
    organizationId: string,
    recipientUserId: string,
    notificationId: string,
  ) {
    const notification = await this.notificationsRepository.findOne({
      where: {
        id: notificationId,
        organizationId,
        recipientUserId,
      },
    });

    if (!notification) {
      return null;
    }

    if (!notification.isRead) {
      notification.isRead = true;
      notification.readAt = new Date();

      await this.notificationsRepository.save(notification);
    }

    return notification;
  }

  async markAllAsRead(organizationId: string, recipientUserId: string) {
    await this.notificationsRepository
      .createQueryBuilder()
      .update(Notification)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where('organization_id = :organizationId', {
        organizationId,
      })
      .andWhere('recipient_user_id = :recipientUserId', {
        recipientUserId,
      })
      .andWhere('is_read = false')
      .execute();

    return {
      message: 'All notifications marked as read',
    };
  }
}
