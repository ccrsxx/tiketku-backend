import { jest } from '@jest/globals';
import { generatePrismaMock } from '../../utils/jest.js';
import { HttpError } from '../../utils/error.js';

jest.unstable_mockModule('../../utils/db.js', generatePrismaMock);
jest.unstable_mockModule('../../utils/emails/core/otp.js', () => ({
  sendOtpEmail: jest.fn()
}));

const { prisma } =
  /** @type {import('../../utils/jest.js').GeneratedPrismaMock} */ (
    /** @type {unknown} */ (await import('../../utils/db.js'))
  );
const { sendOtpEmail } = await import('../../utils/emails/core/otp.js');
const { OtpService } = await import('../otp.js');

describe('OtpService', () => {
  const mockUserId = 'user-123';
  const mockEmail = 'test@example.com';
  const mockName = 'Test User';
  const mockOtp = '123456';
  const mockDate = new Date('2024-01-01');

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
  });

  describe('sendUserVerificationOtp', () => {
    it('should send OTP successfully', async () => {
      prisma.$transaction.mockImplementation((callback) => callback(prisma));
      prisma.otp.create.mockResolvedValue({ otp: mockOtp });
      sendOtpEmail.mockResolvedValue();

      await OtpService.sendUserVerificationOtp(mockName, mockEmail, mockUserId);

      expect(prisma.otp.updateMany).toHaveBeenCalled();
      expect(prisma.otp.create).toHaveBeenCalled();
      expect(sendOtpEmail).toHaveBeenCalledWith({
        otp: mockOtp,
        name: mockName,
        email: mockEmail
      });
    });
  });

  describe('verifyUserVerificationOtp', () => {
    it('should verify OTP successfully', async () => {
      prisma.otp.findFirst.mockResolvedValue({
        userId: mockUserId,
        otp: mockOtp
      });
      prisma.$transaction.mockImplementation((callback) => callback(prisma));

      await OtpService.verifyUserVerificationOtp({
        otp: mockOtp,
        email: mockEmail
      });

      expect(prisma.otp.findFirst).toHaveBeenCalled();
      expect(prisma.otp.updateMany).toHaveBeenCalled();
      expect(prisma.user.update).toHaveBeenCalled();
      expect(prisma.notification.create).toHaveBeenCalled();
    });

    it('should throw error for invalid OTP', async () => {
      prisma.otp.findFirst.mockResolvedValue(null);

      await expect(
        OtpService.verifyUserVerificationOtp({
          otp: 'invalid',
          email: mockEmail
        })
      ).rejects.toThrow(HttpError);
    });
  });
});
