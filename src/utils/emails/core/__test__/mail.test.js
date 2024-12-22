import { jest } from '@jest/globals';

/** @typedef {{ readFile: jest.Mock }} FsPromisesMock */
/** @typedef {{ Record<keyof import('../../../env.js'), jest.Mock> }} EnvMock */

jest.unstable_mockModule(
  'fs/promises',
  () =>
    /** @type {FsPromisesMock} */ ({
      readFile: jest.fn()
    })
);

jest.unstable_mockModule(
  '../../../env.js',
  () =>
    /** @type {EnvMock} */ ({
      appEnv: {
        EMAIL_ADDRESS: 'random-email',
        EMAIL_API_KEY: 'random-api-key'
      }
    })
);

const { readFile } = /** @type {FsPromisesMock} */ (
  await import('fs/promises')
);

const { createEmailTemplate } = await import('../mail.js');

describe('Email functions', () => {
  describe('createEmailTemplate', () => {
    it('should return a compiled handlebars template', async () => {
      const template = 'password-reset';
      const rawEmail = '<h1>Hello, {{name}}</h1>';

      readFile.mockImplementation(async () => rawEmail);

      const emailTemplate = await createEmailTemplate(template);

      const result = emailTemplate({ name: 'John Doe' });

      expect(result).toBe('<h1>Hello, John Doe</h1>');
    });
  });
});
