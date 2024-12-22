import {
  getFunctionThrownError,
  setupExpressMock
} from '../../../utils/jest.js';
import { HttpError } from '../../../utils/error.js';

const { OtpValidationMiddleware } = /** @type {OtpValidationMiddlewareMock} */ (
  /** @type {unknown} */ (await import('../otp.js'))
);

describe('Otp Validation Middleware', () => {
  describe('isValidOtpPayload', () => {
    it('should call next() if the payload is valid', () => {
      const { req, res, next } = setupExpressMock({
        req: {
          body: {
            otp: '123456',
            email: 'user@example.com'
          }
        }
      });

      OtpValidationMiddleware.isValidOtpPayload(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should throw an http error if the email is missing', async () => {
      const { req, res, next } = setupExpressMock({
        req: {
          body: {
            otp: '123456'
          }
        }
      });

      const error = await getFunctionThrownError(() =>
        OtpValidationMiddleware.isValidOtpPayload(req, res, next)
      );

      expect(error).toBeInstanceOf(HttpError);
      expect(error).toHaveProperty('statusCode', 400);
      expect(error).toHaveProperty('message', 'Invalid body');
    });

    it('should throw an http error if the otp is missing', async () => {
      const { req, res, next } = setupExpressMock({
        req: {
          body: {
            email: 'user@example.com'
          }
        }
      });

      const error = await getFunctionThrownError(() =>
        OtpValidationMiddleware.isValidOtpPayload(req, res, next)
      );

      expect(error).toBeInstanceOf(HttpError);
      expect(error).toHaveProperty('statusCode', 400);
      expect(error).toHaveProperty('message', 'Invalid body');
    });
  });
});
