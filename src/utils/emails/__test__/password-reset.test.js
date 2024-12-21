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
    async () => (context) => `<h1>Hello, ${context.name}</h1>`
  )
}));

const { sendResetPasswordEmail } = /** @type {ResetPasswordMock} */ (
  /** @type {unknown} */ (await import('../core/password-reset.js'))
);

const { client, createEmailTemplate } = /** @type {SendEmailMock} */ (
  /** @type {unknown} */ (await import('../core/mail.js'))
);

describe('Password reset functions', () => {
  describe('sendResetPasswordEmail', () => {
    it('should send password reset email', async () => {
      const mockData = {
        name: 'Mas Fufufafa',
        email: 'test@example.com',
        token: 'test-token'
      };

      await sendResetPasswordEmail(mockData);

      expect(createEmailTemplate).toHaveBeenCalledWith('password-reset');
      expect(client.sendMail).toHaveBeenCalledWith({
        from: 'tiketku@mail.com',
        to: mockData.email,
        subject: 'Reset password',
        html: '<h1>Hello, Mas Fufufafa</h1>'
      });
    });
  });
});
