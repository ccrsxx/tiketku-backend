import { prisma } from '../utils/db.js';
import { HttpError } from '../utils/error.js';

/** @param {string} userId */
async function getNotifications(userId) {
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });

  return notifications;
}

/** @param {string} userId */
async function readAllNotifications(userId) {
  await prisma.notification.updateMany({
    where: { userId, viewed: false },
    data: { viewed: true }
  });
}

/**
 * @param {string} notificationId
 * @param {string} userId
 */

async function readNotification(notificationId, userId) {
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, userId }
  });

  if (!notification) {
    throw new HttpError(404, { message: 'Notification not found' });
  }

  await prisma.notification.update({
    where: { id: notificationId },
    data: { viewed: true }
  });
}

/**
 * @param {string} notificationId
 * @param {string} userId
 */
async function deleteNotification(notificationId, userId) {
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, userId }
  });

  if (!notification) {
    throw new HttpError(404, { message: 'Notification not found' });
  }

  await prisma.notification.delete({
    where: { id: notificationId }
  });
}

export const NotificationService = {
  getNotifications,
  readAllNotifications,
  readNotification,
  deleteNotification
};
