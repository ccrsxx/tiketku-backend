import midtransClient from 'midtrans-client';
import { appEnv } from './env.js';

let snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: appEnv.MIDTRANS_SERVER_KEY,
  clientKey: appEnv.MIDTRANS_CLIENT_KEY
});

/**
 * @param {string} order_id
 * @param {number} gross_amount
 * @param {string} first_name
 * @param {string} last_name
 * @param {string} email
 * @param {string} phone
 */
export const midtransParameter = (
  order_id,
  gross_amount,
  first_name,
  last_name,
  email,
  phone
) => {
  return {
    transaction_details: {
      order_id,
      gross_amount
    },
    customer_details: {
      first_name,
      last_name,
      email,
      phone
    }
  };
};

export default snap;
