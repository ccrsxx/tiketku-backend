import { appEnv } from '../../env.js';
import { client, createEmailTemplate } from './mail.js';
import {
  formatDate,
  formatTime,
  getRelativeTimeBetweenDates
} from '../../format.js';

/** @import {OmittedModel} from '../../db.js' */

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
