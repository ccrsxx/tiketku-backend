import { jest } from '@jest/globals';
import { setupExpressMock } from '../../utils/jest.js';

/**
 * @typedef {{
 *   TransactionController: Record<
 *     keyof import('../../controllers/transaction.js')['TransactionController'],
 *     jest.Mock
 *   >;
 * }} TransactionControllerMock
 */

/**
 * @typedef {{
 *   TransactionService: Record<
 *     keyof import('../../services/transaction.js')['TransactionService'],
 *     jest.Mock
 *   >;
 * }} TransactionServiceMock
 */

jest.unstable_mockModule('../../services/transaction.js', () => ({
  TransactionService: {
    createTransaction: jest.fn(),
    getTransaction: jest.fn(),
    cancelTransaction: jest.fn(),
    getMyTransactions: jest.fn(),
    sendTransactionTicket: jest.fn()
  }
}));

const { TransactionController } = /** @type {TransactionControllerMock} */ (
  await import('../../controllers/transaction.js')
);

const { TransactionService } = /** @type {TransactionServiceMock} */ (
  await import('../../services/transaction.js')
);

describe('Transaction controller', () => {
  describe('createTransaction', () => {
    it('should create a new transaction', async () => {
      const { req, res } = setupExpressMock();
      const transaction = { id: '1', amount: 100 };

      TransactionService.createTransaction.mockResolvedValue(transaction);

      req.body = { amount: 100 };
      res.locals = { user: { id: '1' } };

      await TransactionController.createTransaction(req, res);

      expect(TransactionService.createTransaction).toHaveBeenCalledWith(
        { id: '1' },
        req.body
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ data: transaction });
    });
  });

  describe('getTransaction', () => {
    it('should get a specific transaction', async () => {
      const { req, res } = setupExpressMock();
      const transaction = { id: '1', amount: 100 };

      TransactionService.getTransaction.mockResolvedValue(transaction);

      req.params = { id: '1' };
      res.locals = { user: { id: '1' } };

      await TransactionController.getTransaction(req, res);

      expect(TransactionService.getTransaction).toHaveBeenCalledWith('1', '1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ data: transaction });
    });
  });

  describe('cancelTransaction', () => {
    it('should cancel a transaction', async () => {
      const { req, res } = setupExpressMock();

      TransactionService.cancelTransaction.mockResolvedValue(undefined);

      req.params = { id: '1' };
      res.locals = { user: { id: '1' } };

      await TransactionController.cancelTransaction(req, res);

      expect(TransactionService.cancelTransaction).toHaveBeenCalledWith(
        '1',
        '1'
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Transaction has been canceled'
      });
    });
  });

  describe('getMyTransactions', () => {
    it('should get a list of my transactions', async () => {
      const { req, res } = setupExpressMock();
      const transactions = [{ id: '1', amount: 100 }];
      const meta = { total: 1 };

      TransactionService.getMyTransactions.mockResolvedValue({
        transactions,
        meta
      });

      req.query = {};
      res.locals = { user: { id: '1' } };

      await TransactionController.getMyTransactions(req, res);

      expect(TransactionService.getMyTransactions).toHaveBeenCalledWith(
        '1',
        {}
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ meta, data: transactions });
    });
  });

  describe('sendTransactionTicketEmail', () => {
    it('should send a transaction ticket email', async () => {
      const { req, res } = setupExpressMock();

      TransactionService.sendTransactionTicket.mockResolvedValue(undefined);

      req.params = { id: '1' };
      res.locals = { user: { id: '1' } };

      await TransactionController.sendTransactionTicketEmail(req, res);

      expect(TransactionService.sendTransactionTicket).toHaveBeenCalledWith(
        '1',
        '1'
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Transaction ticket email sent successfully'
      });
    });
  });
});
