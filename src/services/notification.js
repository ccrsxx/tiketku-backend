import { prisma } from '../utils/db.js';

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
 * @param {string} _userId
 */

async function readNotification(notificationId, _userId) {
  await prisma.notification.update({
    where: { id: notificationId },
    data: { viewed: true }
  });
}

/**
 * @param {string} notificationId
 * @param {string} _userId
 */
async function deleteNotification(notificationId, _userId) {
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
