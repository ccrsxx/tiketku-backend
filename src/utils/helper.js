import { randomBytes, randomInt } from 'crypto';

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
