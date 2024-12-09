import { prisma } from '../utils/db.js';
import { HttpError } from '../utils/error.js';

/** @import {Request, Response, NextFunction} from 'express'} */
/** @import {OmittedModel} from '../utils/db.js' */

/**
 * @param {Request<{ id: string }>} req
 * @param {Response<
 *   unknown,
 *   { user: OmittedModel<'user'>; notification: OmittedModel<'notification'> }
 * >} res
 * @param {NextFunction} next
 */
async function isNotificationExists(req, res, next) {
  const notification = await prisma.notification.findFirst({
    where: { id: req.params.id, userId: res.locals.user.id }
  });

  if (!notification) {
    throw new HttpError(404, { message: 'Notification not found' });
  }

  res.locals.notification = notification;

  next();
}

export const NotificationMiddleware = {
  isNotificationExists
};
