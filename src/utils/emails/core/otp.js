import { appEnv } from '../../env.js';
import { client, createEmailTemplate } from './mail.js';

/**
 * @typedef {Object} OtpEmailProps
 * @property {string} otp
 * @property {string} name
 * @property {string} email
 */

/**
 * @param {OtpEmailProps} props
 * @returns {Promise<void>}
 */
export async function sendOtpEmail({ otp, name, email }) {
  /**
   * @typedef {Object} OtpContext
   * @property {string} name
   * @property {string} otp
   */

  /** @type {HandlebarsTemplateDelegate<OtpContext>} */
  const emailTemplate = await createEmailTemplate('otp');

  const parsedEmailTemplate = emailTemplate({
    name,
    otp
  });

  await client.sendMail({
    from: appEnv.EMAIL_ADDRESS,
    to: email,
    subject: 'OTP Verification',
    html: parsedEmailTemplate
  });
}
