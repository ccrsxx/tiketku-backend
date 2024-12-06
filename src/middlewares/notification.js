import { prisma } from '../utils/db.js';
import { HttpError } from '../utils/error.js';

/** @import {Request, Response, NextFunction} from 'express'} */
/** @import {User} from '@prisma/client' */

/**
 * @param {Request} req
 * @param {Response<unknown, { user: User }>} res
 * @param {NextFunction} next
 */
async function isNotificationExists(req, res, next) {
  const notification = await prisma.notification.findFirst({
    where: { id: req.params.id, userId: res.locals.user.id }
  });

  if (!notification) {
    throw new HttpError(404, { message: 'Notification not found' });
  }

  next();
}

export const NotificationMiddleware = {
  isNotificationExists
};
