import { jest } from '@jest/globals';
import { setupExpressMock } from '../../utils/jest.js';

/**
 * @typedef {{
 *   UserController: Record<
 *     keyof import('../../controllers/user.js')['UserController'],
 *     jest.Mock
 *   >;
 * }} UserControllerMock
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
  '../../services/user.js',
  () =>
    /** @type {UserServiceMock} */ ({
      UserService: {
        getUser: jest.fn(),
        getUsers: jest.fn(),
        createUser: jest.fn(),
        updateUser: jest.fn()
      }
    })
);

const { UserController } = /** @type {UserControllerMock} */ (
  /** @type {unknown} */ (await import('../../controllers/user.js'))
);

const { UserService } = /** @type {UserServiceMock} */ (
  /** @type {unknown} */ (await import('../../services/user.js'))
);

describe('User controller', () => {
  describe('Get current user', () => {
    it('should get the current user', async () => {
      const user = { id: '1', name: 'User' };

      const { req, res } = setupExpressMock({ res: { locals: { user } } });

      await UserController.getCurrentUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ data: user });
    });
  });

  describe('Create user', () => {
    it('should create a user', async () => {
      const user = { id: '1', name: 'User' };

      UserService.createUser.mockImplementation(() => user);

      const { req, res } = setupExpressMock({
        req: { body: { name: 'User' } }
      });

      await UserController.createUser(req, res);

      expect(UserService.createUser).toHaveBeenCalledWith({ name: 'User' });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ data: user });
    });
  });

  describe('updateCurrentUser', () => {
    it('should update the current user successfully', async () => {
      UserService.updateUser.mockImplementation(() => Promise.resolve());

      const { req, res } = setupExpressMock({
        req: {
          body: {
            name: 'Updated User',
            email: 'updated@example.com'
          }
        },
        res: {
          locals: {
            user: {
              id: '12345'
            }
          }
        }
      });

      await UserController.updateCurrentUser(req, res);

      expect(UserService.updateUser).toHaveBeenCalledWith('12345', {
        name: 'Updated User',
        email: 'updated@example.com'
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User updated successfully'
      });
    });
  });
});
