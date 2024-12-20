import { appEnv } from '../../env.js';
import { client, createEmailTemplate } from './mail.js';

/**
 * @typedef {Object} ResetPasswordEmailProps
 * @property {string} name
 * @property {string} email
 * @property {string} token
 */

/**
 * @param {ResetPasswordEmailProps} props
 * @returns {Promise<void>}
 */
export async function sendResetPasswordEmail({ name, email, token }) {
  /**
   * @typedef {Object} ResetPasswordContext
   * @property {string} name
   * @property {string} url
   */

  /** @type {HandlebarsTemplateDelegate<ResetPasswordContext>} */
  const emailTemplate = await createEmailTemplate('password-reset');

  const parsedEmailTemplate = emailTemplate({
    name,
    url: `${appEnv.FRONTEND_URL}/auth/password-reset/${token}`
  });

  await client.sendMail({
    from: appEnv.EMAIL_ADDRESS,
    to: email,
    subject: 'Reset password',
    html: parsedEmailTemplate
  });
}
