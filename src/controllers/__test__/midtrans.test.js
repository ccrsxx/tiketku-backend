import { jest } from '@jest/globals';
import { setupExpressMock } from '../../utils/jest.js';

/**
 * @typedef {{
 *   MidtransController: Record<
 *     keyof import('../../controllers/midtrans.js')['MidtransController'],
 *     jest.Mock
 *   >;
 * }} MidtransControllerMock
 */

/**
 * @typedef {{
 *   MidtransService: Record<
 *     keyof import('../../services/midtrans.js')['MidtransService'],
 *     jest.Mock
 *   >;
 * }} MidtransServiceMock
 */

jest.unstable_mockModule(
  '../../services/midtrans.js',
  () =>
    /** @type {MidtransServiceMock} */ ({
      MidtransService: {
        manageMidtransNotification: jest.fn()
      }
    })
);

const { MidtransController } = /** @type {MidtransControllerMock} */ (
  /** @type {unknown} */ (await import('../../controllers/midtrans.js'))
);

const { MidtransService } = /** @type {MidtransServiceMock} */ (
  /** @type {unknown} */ (await import('../../services/midtrans.js'))
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

      MidtransService.manageMidtransNotification.mockImplementation(() =>
        Promise.resolve()
      );

      const { req, res } = setupExpressMock({
        req: { body: notificationPayload }
      });

      await MidtransController.manageMidtransNotification(req, res);

      expect(MidtransService.manageMidtransNotification).toHaveBeenCalledWith(
        notificationPayload
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Midtrans notification successfully handled'
      });
    });
  });
});
