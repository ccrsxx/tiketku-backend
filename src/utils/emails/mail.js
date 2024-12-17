import handlebars from 'handlebars';
import { appEnv } from '../env.js';
import { readFile } from 'fs/promises';
import { createTransport } from 'nodemailer';
import {
  formatDate,
  formatTime,
  getRelativeTimeBetweenDates
} from '../format.js';

handlebars.registerHelper('increment', (value) => parseInt(value, 10) + 1);

/** @import {OmittedModel} from '../db.js' */

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
 * @typedef {(OmittedModel<'booking'> & {
 *   passenger: OmittedModel<'passenger'>;
 * })[]} BookingsPassenger
 */

/**
 * @typedef {OmittedModel<'flight'> & {
 *   airline: OmittedModel<'airline'>;
 *   airplane: OmittedModel<'airplane'>;
 *   departureAirport: OmittedModel<'airport'>;
 *   destinationAirport: OmittedModel<'airport'>;
 * }} FlightDetails
 */

/**
 * @typedef {OmittedModel<'transaction'> & {
 *   user: OmittedModel<'user'>;
 *   payment: OmittedModel<'payment'>;
 *   bookings: BookingsPassenger;
 *   returnFlight: FlightDetails | null;
 *   departureFlight: FlightDetails;
 * }} TicketTransaction
 */
/**
 * @typedef {Object} TransactionTicketEmailProps
 * @property {TicketTransaction} transaction
 */

/**
 * @param {TicketTransaction} props
 * @returns {Promise<void>}
 */
export async function sendTransactionTicketEmail({
  user: { name, email },
  code,
  bookings,
  returnFlight,
  departureFlight
}) {
  /**
   * @typedef {Object} ParsedFlightData
   * @property {string} formattedArrivalTime
   * @property {string} formattedRelativeTime
   * @property {string} formattedDepartureDate
   * @property {string} formattedDepartureTime
   *
   * @typedef {FlightDetails & ParsedFlightData} FlightDetailsWithParsedData
   */

  /**
   * @typedef {Object} TransactionTicketContext
   * @property {string} name
   * @property {string} bookingCode
   * @property {BookingsPassenger} bookings
   * @property {FlightDetailsWithParsedData} df
   * @property {FlightDetailsWithParsedData | null} rf
   */

  /** @type {HandlebarsTemplateDelegate<TransactionTicketContext>} */
  const emailTemplate = await createEmailTemplate('ticket');

  /** @type {FlightDetailsWithParsedData} */
  const parsedDepartureFlight = {
    ...departureFlight,
    formattedRelativeTime: getRelativeTimeBetweenDates(
      departureFlight.departureTimestamp,
      departureFlight.arrivalTimestamp
    ),
    formattedArrivalTime: formatTime(departureFlight.arrivalTimestamp),
    formattedDepartureDate: formatDate(departureFlight.departureTimestamp),
    formattedDepartureTime: formatTime(departureFlight.departureTimestamp)
  };

  /** @type {FlightDetailsWithParsedData | null} */
  let parsedReturnFlight = null;

  if (returnFlight) {
    parsedReturnFlight = {
      ...returnFlight,
      formattedRelativeTime: getRelativeTimeBetweenDates(
        returnFlight.departureTimestamp,
        returnFlight.arrivalTimestamp
      ),
      formattedArrivalTime: formatTime(returnFlight.arrivalTimestamp),
      formattedDepartureDate: formatDate(returnFlight.departureTimestamp),
      formattedDepartureTime: formatTime(returnFlight.departureTimestamp)
    };
  }

  const parsedEmailTemplate = emailTemplate({
    df: parsedDepartureFlight,
    rf: parsedReturnFlight,
    name: name,
    bookings: bookings,
    bookingCode: code
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
