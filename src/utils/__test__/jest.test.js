import { getFunctionThrownError } from '../jest.js';
import { HttpError } from '../error.js';

describe('Get function thrown error', () => {
  it('should return the error thrown by the function', async () => {
    const fn = () => {
      throw new Error('Test error');
    };

    const error = await getFunctionThrownError(fn);

    expect(error).toBeInstanceOf(Error);
    expect(error).toHaveProperty('message', 'Test error');
  });

  it('should return the error thrown by the async function', async () => {
    const fn = async () => {
      throw new Error('Test error');
    };

    const error = await getFunctionThrownError(fn);

    expect(error).toBeInstanceOf(Error);
    expect(error).toHaveProperty('message', 'Test error');
  });

  it('should return the custom error thrown by the function', async () => {
    const fn = () => {
      throw new HttpError(400, 'Test error');
    };

    const error = await getFunctionThrownError(fn);

    expect(error).toBeInstanceOf(HttpError);
    expect(error).toHaveProperty('statusCode', 400);
    expect(error).toHaveProperty('message', 'Test error');
  });

  it('should return undefined if the function does not throw an error', async () => {
    const fn = () => {};

    const error = await getFunctionThrownError(fn);

    expect(error).toBeUndefined();
  });
});
