import { jest, describe, expect } from '@jest/globals';

/**
 * @typedef {{
 *   logger: Record<keyof import('../../loaders/pino.js')['logger'], jest.Mock>;
 * }} LoggerMock
 */

/** @typedef {Record<keyof import('fs/promises'), jest.Mock>} FsPromisesMock */
/** @typedef {{ default: Record<keyof import('dotenv'), jest.Mock> }} DotEnvMock */

jest.unstable_mockModule(
  'dotenv',
  () =>
    /** @type {DotEnvMock} */ ({
      default: { config: jest.fn() }
    })
);

jest.unstable_mockModule(
  'fs/promises',
  () =>
    /** @type {FsPromisesMock} */ ({
      access: jest.fn()
    })
);

jest.unstable_mockModule(
  '../../loaders/pino.js',
  () =>
    /** @type {LoggerMock} */ ({
      logger: {
        info: jest.fn()
      }
    })
);

describe('Environment configuration', () => {
  beforeEach(() => {
    process.env = {};
    jest.resetModules();
  });

  /** @param {'production' | 'development'} nodeEnv */
  function generateEnvs(nodeEnv) {
    process.env.PORT = '3000';
    process.env.NODE_ENV = nodeEnv;
    process.env.SENTRY_DSN = 'dsn';
    process.env.JWT_SECRET = 'secret';
    process.env.DIRECT_URL = 'postgresql://user:ss@localhost:5432';
    process.env.DATABASE_URL = 'postgresql://user:ss@localhost:5432';
    process.env.FRONTEND_URL = 'http://localhost:3000';
    process.env.EMAIL_ADDRESS = 'test@email.com';
    process.env.EMAIL_API_KEY = 'secret';
    process.env.VALID_ORIGINS = 'http://localhost:3000';
    process.env.STORAGE_BUCKET = 'storage_bucket';
    process.env.IMAGEKIT_PUBLIC_KEY = 'public';
    process.env.IMAGEKIT_PRIVATE_KEY = 'private';
    process.env.IMAGEKIT_URL_ENDPOINT = 'https://ik.imagekit.io';
    process.env.GOOGLE_APPLICATION_CREDENTIALS = '/path/to/credentials.json';
    process.env.MIDTRANS_SERVER_KEY = 'SB-Mid-server';
    process.env.MIDTRANS_CLIENT_KEY = 'SB-Mid-client';
  }

  async function setupEnvironment() {
    const { access } = /** @type {FsPromisesMock} */ (
      /** @type {unknown} */ (await import('fs/promises'))
    );

    const { logger } = /** @type {LoggerMock} */ (
      /** @type {unknown} */ (await import('../../loaders/pino.js'))
    );

    const { default: dotenv } = /** @type {DotEnvMock} */ (
      /** @type {unknown} */ (await import('dotenv'))
    );

    return { access, logger, dotenv };
  }

  it('should load environment variables from .env file from production', async () => {
    const { access, logger, dotenv } = await setupEnvironment();

    generateEnvs('production');

    access.mockImplementation(() => Promise.resolve());

    await import('../env.js');

    expect(access).not.toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith(
      'Loading environment variables from .env or process.env'
    );
    expect(dotenv.config).toHaveBeenCalledWith({ path: undefined });
  });

  it('should load environment variables from .env.local file from development', async () => {
    const { access, logger, dotenv } = await setupEnvironment();

    generateEnvs('development');

    access.mockImplementation(() => Promise.resolve());

    await import('../env.js');

    expect(access).toHaveBeenCalledWith('.env.local');
    expect(logger.info).toHaveBeenCalledWith(
      'Loading environment variables from .env.local'
    );
    expect(dotenv.config).toHaveBeenCalledWith({ path: '.env.local' });
  });

  it('should throw an error if .env.local file is missing', async () => {
    const { access } = await setupEnvironment();

    generateEnvs('development');

    access.mockImplementation(() => Promise.reject());

    expect(import('../env.js')).rejects.toThrow(
      'Local environment file (.env.local) is missing'
    );
  });

  it('should throw an error if environment variables are missing', async () => {
    const { access } = await setupEnvironment();

    access.mockImplementation(() => Promise.resolve());

    expect(import('../env.js')).rejects.toMatchObject({
      message: expect.stringMatching(/Environment validation error/)
    });
  });
});
