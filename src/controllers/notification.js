import { NotificationService } from '../services/notification.js';

/** @import {Request, Response} from 'express' */
/** @import {User} from '@prisma/client'} */

/**
 * @param {Request} _req
 * @param {Response} res
 */
async function getNotifications(_req, res) {
  const userId = res.locals.user.id;
  const notifications = await NotificationService.getNotifications(userId);

  res.status(200).json({ data: notifications });
}

/**
 * @param {Request} _req
 * @param {Response} res
 */
async function readAllNotifications(_req, res) {
  const userId = res.locals.user.id;
  await NotificationService.readAllNotifications(userId);

  res.status(200).json({ message: 'All notifications marked as read' });
}

/**
 * @param {Request} req
 * @param {Response} res
 */
async function readNotification(req, res) {
  const { id } = req.params;
  const userId = res.locals.user.id;
  await NotificationService.readNotification(id, userId);

  res.status(200).json({ message: `Notification ${id} marked as read` });
}

/**
 * @param {Request} req
 * @param {Response} res
 */
async function deleteNotification(req, res) {
  const { id } = req.params;
  const userId = res.locals.user.id;
  await NotificationService.deleteNotification(id, userId);

  res.status(200).json({ message: `Notification ${id} deleted` });
}

export const NotificationController = {
  getNotifications,
  readAllNotifications,
  readNotification,
  deleteNotification
};
