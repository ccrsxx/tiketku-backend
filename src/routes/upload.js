import { Router } from 'express';
import { AuthMiddleware } from '../middlewares/auth.js';
import { UploadMiddleware } from '../middlewares/upload.js';
import { UploadController } from '../controllers/upload.js';

/** @param {Router} app */
export default (app) => {
  const router = Router();

  app.use('/upload', router);

  router.post(
    '/image',
    UploadMiddleware.parseImage,
    AuthMiddleware.isAuthorized,
    UploadMiddleware.uploadImageToGcs,
    UploadController.uploadImage
  );
};
