import multer from 'multer';
import { HttpError } from './error.js';

const storage = multer.memoryStorage();

const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif'];

export const uploadToMemory = multer({
  storage,
  fileFilter: (_req, file, callback) => {
    const fileExtension = file?.originalname?.split('.').pop();

    const validExtension =
      fileExtension && ALLOWED_IMAGE_EXTENSIONS.includes(fileExtension);

    if (!validExtension) {
      return callback(
        new HttpError(400, { message: 'Only images are allowed' })
      );
    }

    callback(null, true);
  },
  limits: {
    fileSize: 1024 * 1024 * 10 // 10MB
  }
}).single('image');
