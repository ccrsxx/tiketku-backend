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
        login: jest.fn()
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

const { AuthService } = /** @type {AuthServiceMock} */ (
  /** @type {unknown} */ (await import('../../services/auth.js'))
);

const { UserService } = /** @type {UserServiceMock} */ (
  /** @type {unknown} */ (await import('../../services/user.js'))
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
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ data: user });
    });
  });
});
