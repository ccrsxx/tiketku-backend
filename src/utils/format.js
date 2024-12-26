import { getHoursAndMinutesFromUtcTimezone } from './helper.js';

/** @import {ValidUtcTimezone} from './validation.js' */

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'full',
  timeZone: 'UTC'
});

const TIME_FORMATTER = new Intl.DateTimeFormat('en-GB', {
  timeStyle: 'short',
  timeZone: 'UTC'
});

const RELATIVE_TIME_FORMATTER = new Intl.RelativeTimeFormat('en-GB', {
  style: 'short'
});

/**
 * @param {Date} date
 * @param {ValidUtcTimezone} [utcTimezone]
 */
export function formatDate(date, utcTimezone) {
  let parsedDate = new Date(date);

  if (utcTimezone) {
    const { hours, minutes } = getHoursAndMinutesFromUtcTimezone(utcTimezone);

    if (hours) parsedDate.setHours(parsedDate.getHours() + hours);
    if (minutes) parsedDate.setMinutes(parsedDate.getMinutes() + minutes);
  }

  return DATE_TIME_FORMATTER.format(parsedDate);
}

/**
 * @param {Date} date
 * @param {ValidUtcTimezone} [utcTimezone]
 */
export function formatTime(date, utcTimezone) {
  let parsedDate = new Date(date);

  if (utcTimezone) {
    const { hours, minutes } = getHoursAndMinutesFromUtcTimezone(utcTimezone);

    if (hours) parsedDate.setHours(parsedDate.getHours() + hours);
    if (minutes) parsedDate.setMinutes(parsedDate.getMinutes() + minutes);
  }

  return TIME_FORMATTER.format(parsedDate);
}

/**
 * @param {Date} fromDate
 * @param {Date} [toDate=Date] Default is `Date`
 * @returns {string}
 */
export function getRelativeTimeBetweenDates(fromDate, toDate = new Date()) {
  const seconds = Math.floor((+toDate - +fromDate) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  /** @type {string} */
  let formattedRelativeTime;

  if (hours) {
    const remainingMinutes = minutes % 60;

    /** @type {string} */
    let parsedRelativeTime;

    if (remainingMinutes) {
      parsedRelativeTime = `${RELATIVE_TIME_FORMATTER.format(-hours, 'hour')} ${RELATIVE_TIME_FORMATTER.format(-remainingMinutes, 'minute')}`;
    } else {
      parsedRelativeTime = RELATIVE_TIME_FORMATTER.format(-hours, 'hour');
    }

    formattedRelativeTime = parsedRelativeTime;
  } else {
    formattedRelativeTime = RELATIVE_TIME_FORMATTER.format(-minutes, 'minute');
  }

  return formattedRelativeTime.replaceAll('ago', '').trim();
}
