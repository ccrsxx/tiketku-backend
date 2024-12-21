import { jest } from '@jest/globals';

jest.unstable_mockModule('../../env.js', () => ({
  appEnv: {
    EMAIL_ADDRESS: 'tiketku@mail.com'
  }
}));

jest.unstable_mockModule('../core/mail', () => ({
  client: {
    sendMail: jest.fn().mockResolvedValue(true)
  },
  createEmailTemplate: jest.fn(
    async () => (context) => `<h1>Your OTP is ${context.otp}</h1>`
  )
}));

const { sendOtpEmail } = /** @type {ResetPasswordMock} */ (
  /** @type {unknown} */ (await import('../core/otp.js'))
);

const { client, createEmailTemplate } = /** @type {SendEmailMock} */ (
  /** @type {unknown} */ (await import('../core/mail.js'))
);

describe('Otp functions', () => {
  describe('sendOtpEmail', () => {
    it('should send OTP email', async () => {
      const otp = '123456';
      const name = 'John Doe';
      const email = 'example@mail.com';

      await sendOtpEmail({ otp, name, email });

      expect(createEmailTemplate).toHaveBeenCalledWith('otp');
      expect(client.sendMail).toHaveBeenCalledWith({
        from: 'tiketku@mail.com',
        to: email,
        subject: 'OTP Verification',
        html: '<h1>Your OTP is 123456</h1>'
      });
    });
  });
});
