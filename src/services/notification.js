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
 * @param {string} userId
 */
async function readNotification(notificationId, userId) {
  await prisma.notification.update({
    where: { id: notificationId, userId },
    data: { viewed: true }
  });
}

/**
 * @param {string} notificationId
 * @param {string} userId
 */
async function deleteNotification(notificationId, userId) {
  await prisma.notification.delete({
    where: { id: notificationId, userId }
  });
}

export const NotificationService = {
  getNotifications,
  readAllNotifications,
  readNotification,
  deleteNotification
};
