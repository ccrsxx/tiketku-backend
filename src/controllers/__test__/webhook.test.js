import { jest } from '@jest/globals';
import { setupExpressMock } from '../../utils/jest.js';

/**
 * @typedef {Object} WebhookControllerMock
 * @property {jest.Mock} manageMidtransNotification
 * @property {jest.Mock} invalidatePendingTransactions
 */

/**
 * @typedef {Object} WebhookMidtransServiceMock
 * @property {jest.Mock} manageMidtransNotification
 */

/**
 * @typedef {Object} WebhookTransactionServiceMock
 * @property {jest.Mock} invalidatePendingTransactions
 */

jest.unstable_mockModule('../../services/webhook/midtrans.js', () => ({
  WebhookMidtransService: {
    manageMidtransNotification: jest.fn()
  }
}));

jest.unstable_mockModule('../../services/webhook/transaction.js', () => ({
  WebhookTransactionService: {
    invalidatePendingTransactions: jest.fn()
  }
}));

const { WebhookController } = /** @type {WebhookControllerMock} */ (
  await import('../webhook.js')
);

const { WebhookMidtransService } = /** @type {WebhookMidtransServiceMock} */ (
  await import('../../services/webhook/midtrans.js')
);

const { WebhookTransactionService } =
  /** @type {WebhookTransactionServiceMock} */ (
    await import('../../services/webhook/transaction.js')
  );

describe('WebhookController', () => {
  describe('manageMidtransNotification', () => {
    it('should handle midtrans notification successfully', async () => {
      const { req, res } = setupExpressMock();
      req.body = {
        transaction_status: 'capture',
        order_id: 'test-order-123'
      };

      WebhookMidtransService.manageMidtransNotification.mockResolvedValue();

      await WebhookController.manageMidtransNotification(req, res);

      expect(
        WebhookMidtransService.manageMidtransNotification
      ).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Midtrans notification successfully handled'
      });
    });

    it('should handle service errors', async () => {
      const { req, res } = setupExpressMock();
      const error = new Error('Service error');

      WebhookMidtransService.manageMidtransNotification.mockRejectedValue(
        error
      );

      await expect(
        WebhookController.manageMidtransNotification(req, res)
      ).rejects.toThrow(error);
    });
  });

  describe('invalidatePendingTransactions', () => {
    it('should invalidate pending transactions successfully', async () => {
      const { req, res } = setupExpressMock();

      WebhookTransactionService.invalidatePendingTransactions.mockResolvedValue();

      await WebhookController.invalidatePendingTransactions(req, res);

      expect(
        WebhookTransactionService.invalidatePendingTransactions
      ).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Pending payments invalidated'
      });
    });

    it('should handle service errors when invalidating transactions', async () => {
      const { req, res } = setupExpressMock();
      const error = new Error('Service error');

      WebhookTransactionService.invalidatePendingTransactions.mockRejectedValue(
        error
      );

      await expect(
        WebhookController.invalidatePendingTransactions(req, res)
      ).rejects.toThrow(error);
    });
  });
});
