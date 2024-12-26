import { randomBytes, randomInt } from 'crypto';

/** @import {ValidUtcTimezone} from './validation.js' */

/** @returns {string} */
export function generateRandomToken(size = 12) {
  return randomBytes(size).toString('base64url');
}

/** @returns {string} */
export function generateRandomOTP() {
  return randomInt(0, 1_000_000).toString().padStart(6, '0');
}

/**
 * @param {string} str
 * @returns {string}
 */
export function toTitleCase(str) {
  return str.replace(
    /\w\S*/g,
    (text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
  );
}

/**
 * @typedef {Object} FirstAndLastName
 * @property {string | undefined} firstName
 * @property {string | undefined} lastName
 */

/**
 * @param {string} fullName
 * @returns {FirstAndLastName}
 */
export function getFirstAndLastName(fullName) {
  const splittedName = fullName.trim().split(' ');

  const firstName = splittedName[0];
  const lastName = splittedName.slice(1).join(' ');

  return { firstName, lastName };
}

/**
 * @typedef {Object} TicketNotificationPayload
 * @property {string} code
 * @property {string} prefix
 * @property {string} departureAirportCode
 * @property {string} destinationAirportCode
 * @property {boolean} [returnFlight]
 */

/** @param {TicketNotificationPayload} props */
export function getParsedDescriptionTicketNotification({
  code,
  prefix,
  departureAirportCode,
  destinationAirportCode,
  returnFlight
}) {
  let parsedDescription = `${prefix} untuk tiket dengan kode ${code}. Dengan keberangkatan dari ${departureAirportCode} menuju ${destinationAirportCode}`;

  if (returnFlight) {
    parsedDescription += ' (PP).';
  } else {
    parsedDescription += '.';
  }

  return parsedDescription;
}

/**
 * @typedef {Object} FlightDayDeparture
 * @property {Date} startDate
 * @property {Date} endDate
 */

/**
 * @param {Date} date
 * @param {ValidUtcTimezone} utcTimezone
 * @returns {FlightDayDeparture | null}
 */
export function getFlightDateDepartureFilterByTimezone(date, utcTimezone) {
  const { hours, minutes } = getHoursAndMinutesFromUtcTimezone(utcTimezone);

  const startDate = new Date(date);

  // Set the start date to the beginning of the day.
  startDate.setUTCHours(0, 0, 0, 0);

  startDate.setHours(startDate.getHours() - hours);

  // If the offset includes minutes (e.g., UTC+5:30), adjust the minutes as well.
  if (minutes) startDate.setMinutes(minutes);

  const endDate = new Date(startDate);

  endDate.setDate(startDate.getDate() + 1);

  // If the offset has no partial minutes, adjust the end date to the last millisecond of the hour.
  // This prevents the end date from overlapping into the next day in the specified timezone.
  if (!minutes) endDate.setHours(endDate.getHours() - 1, 59, 59, 999);

  return { startDate, endDate };
}

/**
 * @typedef {Object} HoursAndMinutes
 * @property {number} hours
 * @property {number | undefined} minutes
 */

/**
 * @param {ValidUtcTimezone} utcTimezone
 * @returns {HoursAndMinutes}
 */
export function getHoursAndMinutesFromUtcTimezone(utcTimezone) {
  const [_, utcValue] = utcTimezone.split('UTC');

  const [hours, minutes] = utcValue.split(':').map(Number);

  return { hours, minutes };
}
