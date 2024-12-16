import { jest } from '@jest/globals';
import { HttpError } from '../../utils/error.js';
import {
  generatePrismaMock,
  getFunctionThrownError
} from '../../utils/jest.js';

jest.unstable_mockModule('../../utils/db.js', generatePrismaMock);
jest.unstable_mockModule('../../services/auth.js', () => ({
  AuthService: {
    hashPassword: jest.fn()
  }
}));
jest.unstable_mockModule('../../services/otp.js', () => ({
  OtpService: {
    sendUserVerificationOtp: jest.fn()
  }
}));

const { prisma } =
  /** @type {import('../../utils/jest.js').GeneratedPrismaMock} */ (
    /** @type {unknown} */ (await import('../../utils/db.js'))
  );
const { AuthService } =
  /** @type {import('../../services/auth.js').AuthServiceMock} */ (
    /** @type {unknown} */ (await import('../../services/auth.js'))
  );
const { OtpService } =
  /** @type {import('../../services/otp.js').OtpServiceMock} */ (
    /** @type {unknown} */ (await import('../../services/otp.js'))
  );
const { UserService } = await import('../../services/user.js');

describe('UserService', () => {
  describe('createUser', () => {
    it('should create a new user and send verification OTP', async () => {
      const payload = {
        email: 'test@example.com',
        phoneNumber: '1234567890',
        password: 'password123',
        name: 'Test User'
      };

      const hashedPassword = 'hashedPassword';
      AuthService.hashPassword.mockResolvedValue(hashedPassword);

      prisma.user.findFirst.mockResolvedValue(null);

      const createdUser = {
        id: 'user-id',
        ...payload,
        password: hashedPassword,
        image: null,
        admin: false
      };

      prisma.user.create.mockResolvedValue(createdUser);

      await UserService.createUser(payload);

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [{ email: payload.email }, { phoneNumber: payload.phoneNumber }],
          verified: true
        }
      });
      expect(AuthService.hashPassword).toHaveBeenCalledWith(payload.password);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          ...payload,
          password: hashedPassword,
          image: null,
          admin: false
        }
      });
      expect(OtpService.sendUserVerificationOtp).toHaveBeenCalledWith(
        payload.name,
        payload.email,
        createdUser.id
      );
    });

    it('should throw an error if email already exists', async () => {
      const payload = {
        email: 'test@example.com',
        phoneNumber: '1234567890',
        password: 'password123'
      };

      prisma.user.findFirst.mockResolvedValue({
        email: payload.email,
        verified: true
      });

      const promise = UserService.createUser(payload);

      const error = await getFunctionThrownError(() => promise);

      expect(error).toBeInstanceOf(HttpError);
      expect(error).toHaveProperty('statusCode', 409);
      expect(error).toHaveProperty('message', 'Email already exists');
    });
  });

  describe('updateUser', () => {
    it('should update user details', async () => {
      const userId = 'user-id';
      const payload = {
        name: 'Updated Name',
        phoneNumber: '9876543210',
        image: 'updated-image-url'
      };

      prisma.user.findUnique.mockResolvedValue(null);

      await UserService.updateUser(userId, payload);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { phoneNumber: payload.phoneNumber }
      });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: payload
      });
    });

    it('should throw an error if phone number already exists for another user', async () => {
      const userId = 'user-id';
      const payload = {
        name: 'Updated Name',
        phoneNumber: '9876543210',
        image: 'updated-image-url'
      };

      prisma.user.findUnique.mockResolvedValue({
        id: 'different-user-id'
      });

      const promise = UserService.updateUser(userId, payload);

      const error = await getFunctionThrownError(() => promise);

      expect(error).toBeInstanceOf(HttpError);
      expect(error).toHaveProperty('statusCode', 409);
      expect(error).toHaveProperty('message', 'Phone number already exists');
    });
  });
});
