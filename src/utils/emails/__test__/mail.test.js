import { createEmailTemplate } from '../core/mail.js';
import { jest } from '@jest/globals';

/** @typedef {import('../core/mail').createEmailTemplate} CreateEmailTemplateMock */

jest.unstable_mockModule(
  '../core/mail',
  () =>
    /** @type {CreateEmailTemplateMock} */
    ({
      createEmailTemplate: jest.fn()
    })
);

describe('Email functions', () => {
  describe('createEmailTemplate', () => {
    it('should create email template', async () => {
      const template = 'password-reset';
      const emailTemplate = await createEmailTemplate(template);
      expect(emailTemplate).toBeDefined();
    });
  });
});
