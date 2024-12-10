import { setupExpressMock } from '../../utils/jest.js';

/**
 * @typedef {{
 *   UploadController: Record<
 *     keyof import('../../controllers/upload.js')['UploadController'],
 *     jest.Mock
 *   >;
 * }} UploadControllerMock
 */

const { UploadController } = /** @type {UploadControllerMock} */ (
  /** @type {unknown} */ (await import('../../controllers/upload.js'))
);

describe('Upload controller', () => {
  describe('uploadImage', () => {
    it('should return the uploaded image URL', async () => {
      const { req, res } = setupExpressMock({
        res: { locals: { image: 'http://example.com/image.jpg' } }
      });

      await UploadController.uploadImage(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        data: { image: 'http://example.com/image.jpg' }
      });
    });
  });
});
