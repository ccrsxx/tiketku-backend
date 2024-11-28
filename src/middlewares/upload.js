import { MulterError } from 'multer';
import { HttpError } from '../utils/error.js';
import { uploadToMemory } from '../utils/multer.js';
import { UploadService } from '../services/upload.js';

/** @import {Request,Response,NextFunction} from 'express' */
/** @import {User} from '@prisma/client' */

/**
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
function parseImage(req, res, next) {
  uploadToMemory(req, res, (err) => {
    if (err) {
      if (err instanceof MulterError) {
        return next(new HttpError(400, { message: err.message }));
      }

      return next(err);
    }

    next();
  });
}

/**
 * @param {Request} req
 * @param {Response<unknown, { user: User; image: string }>} res
 * @param {NextFunction} next
 */
async function uploadImageToGcs(req, res, next) {
  const file = req.file;

  if (!file) {
    throw new HttpError(400, { message: 'Image file is required' });
  }

  res.locals.image = await UploadService.uploadImageToGcs(file);

  next();
}

export const UploadMiddleware = {
  parseImage,
  uploadImageToGcs
};
