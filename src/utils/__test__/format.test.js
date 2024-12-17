import { formatDate, formatTime, getRelativeTimeBetweenDates } from '../format';

/** @typedef {import('date-fns').Date} Date */

describe('formatDate', () => {
  it('should format date in full en-GB style', () => {
    const date = new Date('2023-12-25T10:30:00');
    expect(formatDate(date)).toBe('Monday 25 December 2023');
  });
});

describe('formatTime', () => {
  it('should format time in short en-GB style', () => {
    const date = new Date('2023-12-25T10:30:00');
    expect(formatTime(date)).toBe('10:30');
  });
});

describe('getRelativeTimeBetweenDates', () => {
  /**
   * Helper function to generate date instances for testing
   *
   * @param {string} from
   * @param {string} to
   * @returns {[Date, Date]}
   */
  function generateDates(from, to) {
    return [new Date(from), new Date(to)];
  }

  it('should return relative time in minutes when less than an hour', () => {
    const [fromDate, toDate] = generateDates(
      '2023-12-25T10:30:00',
      '2023-12-25T10:45:00'
    );
    expect(getRelativeTimeBetweenDates(fromDate, toDate)).toBe('15 min');
  });

  it('should return relative time in hours when more than an hour', () => {
    const [fromDate, toDate] = generateDates(
      '2023-12-25T10:30:00',
      '2023-12-25T12:30:00'
    );
    expect(getRelativeTimeBetweenDates(fromDate, toDate)).toBe('2 hr');
  });

  it('should return relative time in hours and minutes', () => {
    const [fromDate, toDate] = generateDates(
      '2023-12-25T10:30:00',
      '2023-12-25T12:45:00'
    );
    expect(getRelativeTimeBetweenDates(fromDate, toDate)).toBe('2 hr  15 min');
  });

  it('should use current time when toDate is not provided', () => {
    const fromDate = new Date();
    const result = getRelativeTimeBetweenDates(fromDate);
    expect(result).toBe('0 min');
  });
});
