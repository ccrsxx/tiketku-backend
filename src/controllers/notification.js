import { NotificationService } from '../services/notification.js';

/** @import {Request, Response} from 'express' */
/** @import {User} from '@prisma/client'} */

/**
 * @param {Request} _req
 * @param {Response} res
 */
async function getNotifications(_req, res) {
  const notifications = await NotificationService.getNotifications(res.locals.user.id);

  res.status(200).json({ data: notifications });
}

/**
 * @param {Request} _req
 * @param {Response} res
 */
async function readAllNotifications(_req, res) {
  await NotificationService.readAllNotifications(res.locals.user.id);

  res.status(200).json({ message: 'All notifications have been marked as read' });
}

/**
 * @param {Request} req
 * @param {Response} res
 */
async function readNotification(req, res) {
  await NotificationService.readNotification(req.params.id, res.locals.user.id);

  res.status(200).json({ message: 'Notification has been marked as read' });
}

/**
 * @param {Request} req
 * @param {Response} res
 */
async function deleteNotification(req, res) {
  await NotificationService.deleteNotification(req.params.id, res.locals.user.id);

  res.status(200).json({ message: 'Notification has been deleted' });
}

export const NotificationController = {
  getNotifications,
  readAllNotifications,
  readNotification,
  deleteNotification
};
