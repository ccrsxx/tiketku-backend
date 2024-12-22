import { jest } from '@jest/globals';
import { MulterError } from 'multer';
import { getFunctionThrownError } from '../../utils/jest.js';
import { HttpError } from '../../utils/error.js';
import { setupExpressMock } from '../../utils/jest.js';

/**
 * @typedef {{
 *   UploadService: Record<
 *     keyof import('../../services/upload.js')['UploadService'],
 *     jest.Mock
 *   >;
 * }} UploadServiceMock
 */

/**
 * @typedef {{
 *   UploadMiddleware: Record<
 *     keyof import('../upload.js')['UploadMiddleware'],
 *     jest.Mock
 *   >;
 * }} UploadMiddlewareMock
 */

jest.unstable_mockModule('../../utils/multer.js', () => ({
  uploadToMemory: jest.fn()
}));

jest.unstable_mockModule(
  '../../services/upload.js',
  () =>
    /** @type {UploadServiceMock} */ ({
      UploadService: {
        uploadImageToGcs: jest.fn()
      }
    })
);

const { uploadToMemory } = await import('../../utils/multer.js');
const { UploadMiddleware } = /** @type {UploadMiddlewareMock} */ (
  /** @type {unknown} */ (await import('../upload.js'))
);
const { UploadService } = /** @type {UploadServiceMock} */ (
  /** @type {unknown} */ (await import('../../services/upload.js'))
);

describe('UploadMiddleware', () => {
  describe('parseImage', () => {
    it('should call next() when upload successful', async () => {
      const { req, res, next } = setupExpressMock({
        req: {
          file: {
            buffer: Buffer.from('test image'),
            originalname: 'test.jpg'
          }
        }
      });

      uploadToMemory.mockImplementation((_, __, cb) => cb());

      await UploadMiddleware.parseImage(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should return error when multiple files uploaded', async () => {
      const { req, res, next } = setupExpressMock();

      const multerError = new MulterError('LIMIT_UNEXPECTED_FILE');
      uploadToMemory.mockImplementation((_, __, cb) => cb(multerError));

      await UploadMiddleware.parseImage(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(HttpError));
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(HttpError);
      expect(error).toHaveProperty('statusCode', 400);
      expect(error).toHaveProperty('message', 'Only one image is allowed');
    });

    it('should return generic multer error', async () => {
      const { req, res, next } = setupExpressMock();

      const multerError = new MulterError('Some other error');
      uploadToMemory.mockImplementation((_, __, cb) => cb(multerError));

      await UploadMiddleware.parseImage(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(HttpError));
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(HttpError);
      expect(error).toHaveProperty('statusCode', 400);
      expect(error).toHaveProperty('message');
    });

    it('should pass through non-multer errors', async () => {
      const { req, res, next } = setupExpressMock();

      const error = new Error('Regular error');
      uploadToMemory.mockImplementation((_, __, cb) => cb(error));

      await UploadMiddleware.parseImage(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('uploadImageToGcs', () => {
    it('should upload image and set res.locals.image when file exists', async () => {
      const { req, res, next } = setupExpressMock({
        req: {
          file: {
            buffer: Buffer.from('test image'),
            originalname: 'test.jpg'
          }
        }
      });

      const mockImageUrl = 'https://storage.googleapis.com/test.jpg';
      UploadService.uploadImageToGcs.mockResolvedValue(mockImageUrl);

      await UploadMiddleware.uploadImageToGcs(req, res, next);

      expect(UploadService.uploadImageToGcs).toHaveBeenCalledWith(req.file);
      expect(res.locals).toHaveProperty('image', mockImageUrl);
      expect(next).toHaveBeenCalledWith();
    });

    it('should throw error when no file uploaded', async () => {
      const { req, res, next } = setupExpressMock();

      const promise = UploadMiddleware.uploadImageToGcs(req, res, next);

      const error = await getFunctionThrownError(() => promise);

      expect(error).toBeInstanceOf(HttpError);
      expect(error).toHaveProperty('statusCode', 400);
      expect(error).toHaveProperty('message', 'Image file is required');
    });

    it('should pass through upload service errors', async () => {
      const { req, res, next } = setupExpressMock({
        req: {
          file: {
            buffer: Buffer.from('test image'),
            originalname: 'test.jpg'
          }
        }
      });

      const error = new Error('Upload failed');
      UploadService.uploadImageToGcs.mockRejectedValue(error);

      const thrownError = await getFunctionThrownError(() =>
        UploadMiddleware.uploadImageToGcs(req, res, next)
      );

      expect(thrownError).toBe(error);
    });
  });
});
