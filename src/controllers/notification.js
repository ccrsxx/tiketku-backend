import { NotificationService } from '../services/notification.js';

/** @import {Request, Response} from 'express' */
/** @import {OmittedModel} from '../utils/db.js' */

/**
 * @param {Request} _req
 * @param {Response<unknown, { user: OmittedModel<'user'> }>} res
 */
async function getNotifications(_req, res) {
  const notifications = await NotificationService.getNotifications(
    res.locals.user.id
  );

  res.status(200).json({ data: notifications });
}

/**
 * @param {Request} _req
 * @param {Response<unknown, { user: OmittedModel<'user'> }>} res
 */
async function readAllNotifications(_req, res) {
  await NotificationService.readAllNotifications(res.locals.user.id);

  res
    .status(200)
    .json({ message: 'All notifications have been marked as read' });
}

/**
 * @param {Request} _req
 * @param {Response<
 *   unknown,
 *   { user: OmittedModel<'user'>; notification: OmittedModel<'notification'> }
 * >} res
 */
async function readNotification(_req, res) {
  await NotificationService.readNotification(
    res.locals.notification.id,
    res.locals.user.id
  );

  res.status(200).json({ message: 'Notification has been marked as read' });
}

/**
 * @param {Request} _req
 * @param {Response<
 *   unknown,
 *   { user: OmittedModel<'user'>; notification: OmittedModel<'notification'> }
 * >} res
 */
async function deleteNotification(_req, res) {
  await NotificationService.deleteNotification(
    res.locals.notification.id,
    res.locals.user.id
  );

  res.status(200).json({ message: 'Notification has been deleted' });
}

export const NotificationController = {
  getNotifications,
  readAllNotifications,
  readNotification,
  deleteNotification
};
