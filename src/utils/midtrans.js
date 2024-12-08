import midtransClient from 'midtrans-client';
import { appEnv } from './env.js';

/** @import {PaymentType} from 'midtrans-client' */
/** @import {PaymentMethod} from '@prisma/client' */

const core = new midtransClient.CoreApi({
  clientKey: appEnv.MIDTRANS_CLIENT_KEY,
  serverKey: appEnv.MIDTRANS_SERVER_KEY,
  isProduction: false
});

const snap = new midtransClient.Snap({
  clientKey: appEnv.MIDTRANS_CLIENT_KEY,
  serverKey: appEnv.MIDTRANS_SERVER_KEY,
  isProduction: false
});

/** @typedef {Extract<PaymentType, 'credit_card' | 'bank_transfer' | 'qris'>} SelectedPaymentType */

/** @typedef {Record<SelectedPaymentType, PaymentMethod>} ValidPaymentMethodMap */

/** @type {ValidPaymentMethodMap} */
const paymentMethodMap = {
  qris: 'QRIS',
  credit_card: 'CREDIT_CARD',
  bank_transfer: 'BANK_TRANSFER'
};

/**
 * @param {PaymentType} paymentType
 * @returns {PaymentMethod}
 */
export function validatePaymentMethod(paymentType) {
  return paymentMethodMap[/** @type {SelectedPaymentType} */ (paymentType)];
}

export const midtrans = {
  core,
  snap,
  paymentMethodMap,
  validatePaymentMethod
};
