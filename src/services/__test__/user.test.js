import { jest } from '@jest/globals';
import { HttpError } from '../../utils/error.js';
import { getFunctionThrownError } from '../../utils/jest.js';
import { generatePrismaMock } from '../../utils/jest.js';

/** @import {GeneratedPrismaMock} from '../../utils/jest.js' */
/** @import {ValidUserPayload} from '../../middlewares/validation/user.js' */
/** @typedef {Record<keyof import('../../loaders/socket.js'), jest.Mock>} SocketMock */

jest.unstable_mockModule('../../utils/db.js', generatePrismaMock);
jest.unstable_mockModule('../../loaders/socket.js', () => ({
  io: {
    emit: jest.fn()
  }
}));

const { UserService } = await import('../user.js');

const { prisma } = /** @type {GeneratedPrismaMock} */ (
  /** @type {unknown} */ (await import('../../utils/db.js'))
);

describe('User service', () => {
  describe('Get user', () => {
    it('should return a user if user exists', async () => {
      const id = '1';

      const user = {
        id: '1',
        email: 'test@email.com',
        password: 'password'
      };

      prisma.user.findUnique.mockImplementation(() => user);

      const result = await UserService.getUser(id);

      expect(result).toEqual(user);
    });

    it('should throw 404 http error if user does not exist', async () => {
      prisma.user.findUnique.mockImplementation(() => null);

      const promise = UserService.getUser('1');

      const error = await getFunctionThrownError(() => promise);

      expect(error).toBeInstanceOf(HttpError);
      expect(error).toHaveProperty('statusCode', 404);
      expect(error).toHaveProperty('message', 'User not found');
    });
  });

  describe('Get users', () => {
    it('should return a list of users', async () => {
      const users = Array.from({ length: 3 }, (_, i) => ({
        id: i.toString(),
        email: 'test@email.com',
        password: 'password'
      }));

      prisma.user.findMany.mockImplementation(() => users);

      const result = await UserService.getUsers();

      expect(result).toEqual(users);
    });
  });

  describe('Create user', () => {
    it('should create a user', async () => {
      /** @type {ValidUserPayload} */
      const user = {
        name: 'Test User',
        email: 'test@email.com',
        address: 'Test Address',
        password: 'password',
        identityType: 'KTP',
        identityNumber: '1234567890'
      };

      const existingUser = null;

      prisma.user.findUnique.mockImplementation(() => existingUser);

      prisma.user.create.mockImplementation(() => user);

      const result = await UserService.createUser(user);

      expect(result).toEqual(user);
    });
  });

  it('should throw 409 http error if user already exists', async () => {
    /** @type {ValidUserPayload} */
    const user = {
      name: 'Test User',
      email: 'test@email.com',
      address: 'Test Address',
      password: 'password',
      identityType: 'KTP',
      identityNumber: '1234567890'
    };

    const existingUser = {
      id: '1',
      email: user.email
    };

    prisma.user.findUnique.mockImplementation(() => existingUser);

    const promise = UserService.createUser(user);

    const error = await getFunctionThrownError(() => promise);

    expect(error).toBeInstanceOf(HttpError);
    expect(error).toHaveProperty('statusCode', 409);
    expect(error).toHaveProperty('message', 'User already registered');
  });
});
