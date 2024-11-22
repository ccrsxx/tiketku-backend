import { MulterError } from 'multer';
import { HttpError } from '../utils/error.js';
import { imageKit } from '../utils/image.js';
import { uploadToMemory } from '../utils/multer.js';

/** @import {Request,Response,NextFunction} from 'express' */
/** @import {User} from '@prisma/client' */

export class UploadMiddleware {
  /**
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  static parseImage(req, res, next) {
    uploadToMemory(req, res, (err) => {
      if (err) {
        if (err instanceof MulterError) {
          return next(new HttpError(400, err.message));
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
  static uploadToImageKit(req, res, next) {
    const file = req.file;

    if (!file) {
      throw new HttpError(400, 'Image file is required');
    }

    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExtension}`;

    imageKit.upload(
      {
        file: file.buffer.toString('base64'),
        fileName
      },
      (err, result) => {
        if (err) return next(err);

        res.locals.image = /** @type {string} */ (result?.url);

        next();
      }
    );
  }
}
