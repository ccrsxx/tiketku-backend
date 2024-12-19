import { jest } from '@jest/globals';
import { generatePrismaMock } from '../../utils/jest.js';

jest.unstable_mockModule('../../utils/db.js', generatePrismaMock);

const { prisma } =
  /** @type {import('../../utils/jest.js').GeneratedPrismaMock} */ (
    /** @type {unknown} */ (await import('../../utils/db.js'))
  );
const { NotificationService } = await import('../notification.js');

describe('NotificationService', () => {
  describe('getNotifications', () => {
    it('should fetch all notifications for the user from the token in descending order of creation', async () => {
      const userId = 'user-id-from-token';
      const mockNotifications = [
        { id: 'notif1', viewed: false, createdAt: new Date() },
        { id: 'notif2', viewed: false, createdAt: new Date() }
      ];

      prisma.notification.findMany.mockResolvedValue(mockNotifications);

      const result = await NotificationService.getNotifications(userId);

      expect(prisma.notification.findMany).toHaveBeenCalledWith({
        where: { userId },
        omit: { createdAt: false },
        orderBy: { createdAt: 'desc' }
      });

      expect(result).toEqual(mockNotifications);
    });
  });

  describe('readAllNotifications', () => {
    it('should mark all notifications as viewed for the user from the token', async () => {
      const userId = 'user-id-from-token';

      prisma.notification.updateMany.mockResolvedValue({ count: 2 });

      await NotificationService.readAllNotifications(userId);

      expect(prisma.notification.updateMany).toHaveBeenCalledWith({
        where: { userId, viewed: false },
        data: { viewed: true }
      });
    });
  });

  describe('readNotification', () => {
    it('should mark a specific notification as viewed for the user from the token', async () => {
      const notificationId = 'notif-id';
      const userId = 'user-id-from-token';
      const mockNotification = {
        id: notificationId,
        viewed: false,
        createdAt: new Date()
      };

      prisma.notification.update.mockResolvedValue(mockNotification);

      await NotificationService.readNotification(notificationId, userId);

      expect(prisma.notification.update).toHaveBeenCalledWith({
        where: { id: notificationId, userId },
        data: { viewed: true }
      });
    });
  });

  describe('deleteNotification', () => {
    it('should delete a specific notification for the user from the token', async () => {
      const notificationId = 'notif-id';
      const userId = 'user-id-from-token';
      const mockNotification = {
        id: notificationId,
        viewed: false,
        createdAt: new Date()
      };

      prisma.notification.delete.mockResolvedValue(mockNotification);

      await NotificationService.deleteNotification(notificationId, userId);

      expect(prisma.notification.delete).toHaveBeenCalledWith({
        where: { id: notificationId, userId }
      });
    });
  });
});
