import { jest } from '@jest/globals';
import { setupExpressMock } from '../../utils/jest.js';

/**
 * @typedef {{
 *   AuthController: Record<
 *     keyof import('../../controllers/auth.js')['AuthController'],
 *     jest.Mock
 *   >;
 * }} AuthControllerMock
 */

/**
 * @typedef {{
 *   AuthService: Record<
 *     keyof import('../../services/auth.js')['AuthService'],
 *     jest.Mock
 *   >;
 * }} AuthServiceMock
 */

/**
 * @typedef {{
 *   UserService: Record<
 *     keyof import('../../services/user.js')['UserService'],
 *     jest.Mock
 *   >;
 * }} UserServiceMock
 */

jest.unstable_mockModule(
  '../../services/auth.js',
  () =>
    /** @type {AuthServiceMock} */ ({
      AuthService: {
        login: jest.fn(),
        sendPasswordResetEmail: jest.fn(),
        resetPassword: jest.fn(),
        verifyPasswordResetToken: jest.fn()
      }
    })
);

jest.unstable_mockModule(
  '../../services/user.js',
  () =>
    /** @type {UserServiceMock} */ ({
      UserService: {
        createUser: jest.fn()
      }
    })
);

jest.unstable_mockModule(
  '../../services/otp.js',
  () =>
    /** @type {UserServiceMock} */ ({
      OtpService: {
        sendUserVerificationOtp: jest.fn(),
        verifyUserVerificationOtp: jest.fn()
      }
    })
);

const { AuthService } = /** @type {AuthServiceMock} */ (
  /** @type {unknown} */ (await import('../../services/auth.js'))
);

const { UserService } = /** @type {UserServiceMock} */ (
  /** @type {unknown} */ (await import('../../services/user.js'))
);

const { OtpService } = /** @type {UserServiceMock} */ (
  /** @type {unknown} */ (await import('../../services/otp.js'))
);

const { AuthController } = /** @type {AuthControllerMock} */ (
  /** @type {unknown} */ (await import('../auth.js'))
);

describe('User controller', () => {
  describe('Login', () => {
    it('should login', async () => {
      const userWithToken = { id: '1', name: 'User', token: 'token' };

      AuthService.login.mockImplementation(() => userWithToken);

      const { req, res } = setupExpressMock();

      await AuthController.login(req, res);

      expect(AuthService.login).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ data: userWithToken });
    });
  });

  describe('Register', () => {
    it('should register', async () => {
      const user = { id: '1', name: 'User' };

      UserService.createUser.mockImplementation(() => user);

      const { req, res } = setupExpressMock();

      await AuthController.register(req, res);

      expect(UserService.createUser).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        data: { message: 'Register success, waiting for OTP verification' }
      });
    });
  });
});

describe('Auth controller', () => {
  describe('Send Password Reset Email', () => {
    it('should send a password reset email', async () => {
      AuthService.sendPasswordResetEmail.mockImplementation(() =>
        Promise.resolve()
      );

      const { req, res } = setupExpressMock({
        req: { body: { email: 'user@example.com' } }
      });

      await AuthController.sendPasswordResetEmail(req, res);

      expect(AuthService.sendPasswordResetEmail).toHaveBeenCalledWith(
        'user@example.com'
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Password reset email sent if email exists'
      });
    });
  });

  describe('Reset Password', () => {
    it('should reset password', async () => {
      AuthService.resetPassword.mockImplementation(() => Promise.resolve());

      const { req, res } = setupExpressMock({
        req: { body: { token: 'valid-token', newPassword: 'newpassword123' } }
      });

      await AuthController.resetPassword(req, res);

      expect(AuthService.resetPassword).toHaveBeenCalledWith({
        token: 'valid-token',
        newPassword: 'newpassword123'
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Password reset successful'
      });
    });
  });

  describe('Verify Password Reset Token', () => {
    it('should verify password reset token', async () => {
      AuthService.verifyPasswordResetToken.mockImplementation(() =>
        Promise.resolve()
      );

      const { req, res } = setupExpressMock({
        req: { params: { token: 'valid-token' } }
      });

      await AuthController.verifyPasswordResetToken(req, res);

      expect(AuthService.verifyPasswordResetToken).toHaveBeenCalledWith(
        'valid-token'
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Password reset token is valid'
      });
    });
  });

  describe('Send User Verification OTP', () => {
    it('should send user verification OTP', async () => {
      OtpService.sendUserVerificationOtp.mockImplementation(() =>
        Promise.resolve()
      );

      const { req, res } = setupExpressMock({
        res: {
          locals: { user: { id: '1', name: 'User', email: 'user@example.com' } }
        }
      });

      await AuthController.sendUserVerificationOtp(req, res);

      expect(OtpService.sendUserVerificationOtp).toHaveBeenCalledWith(
        'User',
        'user@example.com',
        '1'
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'OTP sent successfully'
      });
    });
  });

  describe('Verify User Verification OTP', () => {
    it('should verify user verification OTP', async () => {
      OtpService.verifyUserVerificationOtp.mockImplementation(() =>
        Promise.resolve()
      );

      const { req, res } = setupExpressMock({
        req: { body: { otp: '123456', userId: '1' } }
      });

      await AuthController.verifyUserVerificationOtp(req, res);

      expect(OtpService.verifyUserVerificationOtp).toHaveBeenCalledWith({
        otp: '123456',
        userId: '1'
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'OTP verified successfully'
      });
    });
  });
});
