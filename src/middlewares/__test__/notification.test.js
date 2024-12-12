import { jest } from '@jest/globals';
import { getFunctionThrownError } from '../../utils/jest.js';
import { HttpError } from '../../utils/error.js';
import { setupExpressMock } from '../../utils/jest.js';

/** @typedef {import('../../middleware/notification.js').NotificationMiddleware} NotificationMiddlewareType */
/** @typedef {import('../../utils/jest.js').GeneratedPrismaMock} GeneratedPrismaMock */

jest.unstable_mockModule('../../utils/db.js', () => ({
  prisma: /** @type {GeneratedPrismaMock} */ ({
    notification: {
      findFirst: jest.fn()
    }
  })
}));

const { prisma } = /** @type {GeneratedPrismaMock} */ (
  /** @type {unknown} */ (await import('../../utils/db.js'))
);

const { NotificationMiddleware } = /** @type {NotificationMiddlewareType} */ (
  /** @type {unknown} */ (await import('../notification.js'))
);

describe('NotificationMiddleware.isNotificationExists', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call next when notification exists', async () => {
    const { req, res, next } = setupExpressMock({
      req: { params: { id: 'notif123' } },
      res: { locals: { user: { id: 'user123' } } }
    });

    const mockNotification = { id: 'notif123', userId: 'user123' };
    prisma.notification.findFirst.mockResolvedValueOnce(mockNotification);

    await NotificationMiddleware.isNotificationExists(req, res, next);

    expect(prisma.notification.findFirst).toHaveBeenCalledWith({
      where: { id: 'notif123', userId: 'user123' }
    });
    expect(res.locals).toHaveProperty('notification', mockNotification);
    expect(next).toHaveBeenCalled();
  });

  it('should throw HttpError when notification does not exist', async () => {
    const { req, res, next } = setupExpressMock({
      req: { params: { id: 'notif123' } },
      res: { locals: { user: { id: 'user123' } } }
    });

    prisma.notification.findFirst.mockResolvedValueOnce(null);

    const promise = NotificationMiddleware.isNotificationExists(req, res, next);
    const error = await getFunctionThrownError(() => promise);

    expect(error).toBeInstanceOf(HttpError);
    expect(error).toHaveProperty('statusCode', 404);
    expect(error).toHaveProperty('message', 'Notification not found');
  });

  it('should handle errors from the database', async () => {
    const { req, res, next } = setupExpressMock({
      req: { params: { id: 'notif123' } },
      res: { locals: { user: { id: 'user123' } } }
    });

    const mockError = new Error('Database error');
    prisma.notification.findFirst.mockRejectedValueOnce(mockError);

    const promise = NotificationMiddleware.isNotificationExists(req, res, next);
    const error = await getFunctionThrownError(() => promise);

    expect(error).toBe(mockError);
  });
});
