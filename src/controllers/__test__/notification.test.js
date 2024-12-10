import { jest } from '@jest/globals';
import { setupExpressMock } from '../../utils/jest.js';

/**
 * @typedef {{
 *   NotificationController: Record<
 *     keyof import('../../controllers/notification.js')['NotificationController'],
 *     jest.Mock
 *   >;
 * }} NotificationControllerMock
 */

/**
 * @typedef {{
 *   NotificationService: Record<
 *     keyof import('../../services/notification.js')['NotificationService'],
 *     jest.Mock
 *   >;
 * }} NotificationServiceMock
 */

jest.unstable_mockModule(
  '../../services/notification.js',
  () =>
    /** @type {NotificationServiceMock} */ ({
      NotificationService: {
        getNotifications: jest.fn(),
        readAllNotifications: jest.fn(),
        readNotification: jest.fn(),
        deleteNotification: jest.fn()
      }
    })
);

const { NotificationController } = /** @type {NotificationControllerMock} */ (
  /** @type {unknown} */ (await import('../../controllers/notification.js'))
);

const { NotificationService } = /** @type {NotificationServiceMock} */ (
  /** @type {unknown} */ (await import('../../services/notification.js'))
);

describe('Notification controller', () => {
  describe('getNotifications', () => {
    it('should return notifications for the user', async () => {
      NotificationService.getNotifications.mockResolvedValue([
        { id: '1', message: 'Notification 1' },
        { id: '2', message: 'Notification 2' }
      ]);

      const { req, res } = setupExpressMock({
        res: { locals: { user: { id: '12345' } } }
      });

      await NotificationController.getNotifications(req, res);

      expect(NotificationService.getNotifications).toHaveBeenCalledWith(
        '12345'
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        data: [
          { id: '1', message: 'Notification 1' },
          { id: '2', message: 'Notification 2' }
        ]
      });
    });
  });

  describe('readAllNotifications', () => {
    it('should mark all notifications as read', async () => {
      NotificationService.readAllNotifications.mockResolvedValue();

      const { req, res } = setupExpressMock({
        res: { locals: { user: { id: '12345' } } }
      });

      await NotificationController.readAllNotifications(req, res);

      expect(NotificationService.readAllNotifications).toHaveBeenCalledWith(
        '12345'
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'All notifications have been marked as read'
      });
    });
  });

  describe('readNotification', () => {
    it('should mark a notification as read', async () => {
      NotificationService.readNotification.mockResolvedValue();

      const { req, res } = setupExpressMock({
        res: {
          locals: {
            user: { id: '12345' },
            notification: { id: '67890' }
          }
        }
      });

      await NotificationController.readNotification(req, res);

      expect(NotificationService.readNotification).toHaveBeenCalledWith(
        '67890',
        '12345'
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Notification has been marked as read'
      });
    });
  });

  describe('deleteNotification', () => {
    it('should delete a notification', async () => {
      NotificationService.deleteNotification.mockResolvedValue();

      const { req, res } = setupExpressMock({
        res: {
          locals: {
            user: { id: '12345' },
            notification: { id: '67890' }
          }
        }
      });

      await NotificationController.deleteNotification(req, res);

      expect(NotificationService.deleteNotification).toHaveBeenCalledWith(
        '67890',
        '12345'
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Notification has been deleted'
      });
    });
  });
});
