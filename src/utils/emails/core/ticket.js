import { appEnv } from '../../env.js';
import { client, createEmailTemplate } from './mail.js';
import {
  formatDate,
  formatTime,
  getRelativeTimeBetweenDates
} from '../../format.js';
import { validUtcTimezoneSchema } from '../../validation.js';

/** @import {OmittedModel} from '../../db.js' */
/** @import {ValidUtcTimezone} from '../../validation.js' */

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
 * @param {ValidUtcTimezone | undefined} utcTimezone
 * @returns {Promise<void>}
 */
export async function sendTransactionTicketEmail(
  { user: { name, email }, code, bookings, returnFlight, departureFlight },
  utcTimezone
) {
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

  const parsedUtcTimezone =
    validUtcTimezoneSchema.safeParse(utcTimezone).data ?? 'UTC+0';

  /** @type {FlightDetailsWithParsedData} */
  const parsedDepartureFlight = {
    ...departureFlight,
    formattedRelativeTime: getRelativeTimeBetweenDates(
      departureFlight.departureTimestamp,
      departureFlight.arrivalTimestamp
    ),
    formattedArrivalTime: formatTime(
      departureFlight.arrivalTimestamp,
      parsedUtcTimezone
    ),
    formattedDepartureDate: formatDate(
      departureFlight.departureTimestamp,
      parsedUtcTimezone
    ),
    formattedDepartureTime: formatTime(
      departureFlight.departureTimestamp,
      parsedUtcTimezone
    )
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
      formattedArrivalTime: formatTime(
        returnFlight.arrivalTimestamp,
        parsedUtcTimezone
      ),
      formattedDepartureDate: formatDate(
        returnFlight.departureTimestamp,
        parsedUtcTimezone
      ),
      formattedDepartureTime: formatTime(
        returnFlight.departureTimestamp,
        parsedUtcTimezone
      )
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
