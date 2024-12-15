import handlebars from 'handlebars';
import { readFile } from 'fs/promises';
import { createTransport } from 'nodemailer';
import { appEnv } from '../env.js';

const client = createTransport({
  service: 'Gmail',
  auth: {
    user: appEnv.EMAIL_ADDRESS,
    pass: appEnv.EMAIL_API_KEY
  }
});

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

/**
 * @typedef {Object} FlightInfo
 * @property {string} [departureCity]
 * @property {string} [destinationCity]
 * @property {string} [departureAirport]
 * @property {string} [destinationAirport]
 * @property {string} [flightNumber]
 * @property {string} [date]
 * @property {string} [departureTime]
 * @property {string} [arrivalTime]
 * @property {number} [durationMinutes]
 */

/**
 * @typedef {Object} PassengerInfo
 * @property {string} name
 * @property {string} type
 */

/**
 * @typedef {Object} TransactionTicketEmailProps
 * @property {string} email
 * @property {string} name
 * @property {PassengerInfo[]} passengers
 * @property {FlightInfo} departureFlight
 * @property {FlightInfo | null} [returnFlight]
 */

/**
 * @param {TransactionTicketEmailProps} props
 * @returns {Promise<void>}
 */
export async function sendTransactionTicketEmail({
  email,
  name,
  passengers,
  departureFlight,
  returnFlight
}) {
  /**
   * @typedef {Object} TransactionTicketContext
   * @property {string} name
   * @property {PassengerInfo[]} passengers
   * @property {FlightInfo} departureFlight
   * @property {FlightInfo | null} [returnFlight]
   */

  /** @type {HandlebarsTemplateDelegate<TransactionTicketContext>} */
  const emailTemplate = await createEmailTemplate('ticket');

  const parsedEmailTemplate = emailTemplate({
    name,
    passengers,
    departureFlight,
    returnFlight
  });

  await client.sendMail({
    from: appEnv.EMAIL_ADDRESS,
    to: email,
    subject: 'E-Ticket Tiketku',
    html: parsedEmailTemplate
  });
}

/** @typedef {'password-reset' | 'otp' | 'ticket'} EmailTemplate */

/**
 * @param {EmailTemplate} template
 * @returns {Promise<HandlebarsTemplateDelegate>}
 */
async function createEmailTemplate(template) {
  const rawEmail = await readFile(
    `./src/utils/emails/build/${template}.html`,
    'utf8'
  );

  const parsedEmail = handlebars.compile(rawEmail);

  return parsedEmail;
}
