import { jest } from '@jest/globals';

jest.unstable_mockModule('../../env.js', () => ({
  appEnv: {
    EMAIL_ADDRESS: 'tiketku@mail.com'
  }
}));

jest.unstable_mockModule('../../format.js', () => ({
  formatDate: jest.fn((timestamp) => `formattedDate-${timestamp}`),
  formatTime: jest.fn((timestamp) => `formattedTime-${timestamp}`),
  getRelativeTimeBetweenDates: jest.fn(
    (start, end) => `relativeTime-${start}-${end}`
  )
}));

jest.unstable_mockModule('../core/mail.js', () => ({
  client: {
    sendMail: jest.fn().mockResolvedValue(true)
  },
  createEmailTemplate: jest.fn(
    async () => (context) => `<h1>Transaction Ticket of ${context.name}</h1>`
  )
}));

const { sendTransactionTicketEmail } = await import('../core/ticket.js');
const { client, createEmailTemplate } = await import('../core/mail.js');
const { formatDate, formatTime, getRelativeTimeBetweenDates } = await import(
  '../../format.js'
);

describe('sendTransactionTicketEmail', () => {
  it('should send a transaction ticket email', async () => {
    const mockTransaction = {
      user: { name: 'Agus Ni Boss', email: 'test@example.com' },
      code: 'ABC123',
      bookings: [{ passenger: { name: 'Passenger 1' } }],
      returnFlight: {
        departureTimestamp: 12345,
        arrivalTimestamp: 54321,
        airline: { name: 'Mock Airline' },
        departureAirport: { name: 'Mock Airport A' },
        destinationAirport: { name: 'Mock Airport B' }
      },
      departureFlight: {
        departureTimestamp: 67890,
        arrivalTimestamp: 98765,
        airline: { name: 'Mock Airline' },
        departureAirport: { name: 'Mock Airport A' },
        destinationAirport: { name: 'Mock Airport B' }
      }
    };

    await sendTransactionTicketEmail(mockTransaction);

    expect(formatDate).toHaveBeenCalledTimes(2);
    expect(formatTime).toHaveBeenCalledTimes(4);
    expect(getRelativeTimeBetweenDates).toHaveBeenCalledTimes(2);

    expect(createEmailTemplate).toHaveBeenCalledWith('ticket');

    expect(client.sendMail).toHaveBeenCalledWith({
      from: 'tiketku@mail.com',
      to: 'test@example.com',
      subject: 'E-Ticket Tiketku',
      html: '<h1>Transaction Ticket of Agus Ni Boss</h1>'
    });
  });
});
