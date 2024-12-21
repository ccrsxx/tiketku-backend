import handlebars from 'handlebars';
import { appEnv } from '../../env.js';
import { readFile } from 'fs/promises';
import { createTransport } from 'nodemailer';

handlebars.registerHelper('increment', (value) => parseInt(value, 10) + 1);

export const client = createTransport({
  service: 'Gmail',
  auth: {
    user: appEnv.EMAIL_ADDRESS,
    pass: appEnv.EMAIL_API_KEY
  }
});
/** @typedef {'password-reset' | 'otp' | 'ticket'} EmailTemplate */

/**
 * @param {EmailTemplate} template
 * @returns {Promise<HandlebarsTemplateDelegate>}
 */
export async function createEmailTemplate(template) {
  const rawEmail = await readFile(
    `./src/utils/emails/build/${template}.html`,
    'utf8'
  );

  const parsedEmail = handlebars.compile(rawEmail);

  return parsedEmail;
}
