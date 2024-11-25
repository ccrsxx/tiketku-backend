import { HttpError } from '../error.js';

describe('Http Error', () => {
  it('should create an instance of HttpError', () => {
    const error = new HttpError(404, { message: 'Not Found' });

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(HttpError);

    expect(error.statusCode).toBe(404);
    expect(error.message).toBe('Not Found');
  });
});
