import { jest } from '@jest/globals';
import { setupExpressMock } from '../../utils/jest.js';

/**
 * @typedef {{
 *   WebhookController: Record<
 *     keyof import('../webhook.js')['WebhookController'],
 *     jest.Mock
 *   >;
 * }} WebhookControllerMock
 */

/**
 * @typedef {{
 *   WebhookMidtransService: Record<
 *     keyof import('../../services/webhook/midtrans.js')['MidtransService'],
 *     jest.Mock
 *   >;
 * }} WebhookMidtransServiceMock
 */

/**
 * @typedef {{
 *   WebhookTransactionService: Record<
 *     keyof import('../../services/webhook/transaction.js')['TransactionService'],
 *     jest.Mock
 *   >;
 * }} WebhookTransactionServiceMock
 */

jest.unstable_mockModule(
  '../../services/webhook/midtrans.js',
  () =>
    /** @type {WebhookMidtransServiceMock} */ ({
      WebhookMidtransService: {
        manageMidtransNotification: jest.fn()
      }
    })
);

jest.unstable_mockModule(
  '../../services/webhook/transaction.js',
  () =>
    /** @type {WebhookTransactionServiceMock} */ ({
      WebhookTransactionService: {
        invalidatePendingTransactions: jest.fn()
      }
    })
);

const { WebhookController } = /** @type {WebhookControllerMock} */ (
  /** @type {unknown} */ (await import('../webhook.js'))
);

const { WebhookMidtransService } = /** @type {WebhookMidtransServiceMock} */ (
  /** @type {unknown} */ (await import('../../services/webhook/midtrans.js'))
);

const { WebhookTransactionService } =
  /** @type {WebhookTransactionServiceMock} */ (
    /** @type {unknown} */ (
      await import('../../services/webhook/transaction.js')
    )
  );

describe('Midtrans controller', () => {
  describe('manageMidtransNotification', () => {
    it('should handle Midtrans notification successfully', async () => {
      const notificationPayload = {
        transaction_id: 'txn_123',
        order_id: 'order_123',
        transaction_status: 'settlement',
        gross_amount: '1000000'
      };

      WebhookMidtransService.manageMidtransNotification.mockImplementation(() =>
        Promise.resolve()
      );

      const { req, res } = setupExpressMock({
        req: { body: notificationPayload }
      });

      await WebhookController.manageMidtransNotification(req, res);

      expect(
        WebhookMidtransService.manageMidtransNotification
      ).toHaveBeenCalledWith(notificationPayload);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Midtrans notification successfully handled'
      });
    });
  });

  describe('invalidatePendingTransactions', () => {
    it('should invalidate pending transactions and respond with success', async () => {
      // Mock the service to resolve successfully
      WebhookTransactionService.invalidatePendingTransactions.mockImplementation(
        () => Promise.resolve()
      );

      // Mock Express req and res objects
      const { req, res } = setupExpressMock();

      // Call the controller method
      await WebhookController.invalidatePendingTransactions(req, res);

      // Assertions
      expect(
        WebhookTransactionService.invalidatePendingTransactions
      ).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Pending payments invalidated'
      });
    });
  });
});
