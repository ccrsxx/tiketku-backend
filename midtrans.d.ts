declare module 'midtrans-client' {
  type ConfigOptions = {
    serverKey: string;
    clientKey: string;
    isProduction: boolean;
  };

  type CustomerDetails = {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };

  type TransactionDetails = {
    order_id: string;
    gross_amount: number;
  };

  type CreditCard = {
    secure: boolean;
  };

  type CreateTransactionPayload = {
    credit_card?: CreditCard;
    customer_details?: Partial<CustomerDetails>;
    transaction_details: TransactionDetails;
  };

  type TransactionResponse = {
    token: string;
    redirect_url: string;
  };

  type TransactionStatus =
    | 'deny'
    | 'cancel'
    | 'expire'
    | 'pending'
    | 'capture'
    | 'settlement';

  type FraudStatus = 'accept' | 'deny';

  type PaymentType =
    | 'qris'
    | 'gopay'
    | 'akulaku'
    | 'echannel'
    | 'shopeepay'
    | 'credit_card'
    | 'bank_transfer';

  type NotificationPayload = {
    transaction_id: string;
    transaction_time: string;
    transaction_status: TransactionStatus;
    order_id: string;
    status_code: string;
    payment_type: PaymentType;
    status_message: string;
    signature_key: string;
    settlement_time: string;
    merchant_id: string;
    gross_amount: string;
    fraud_status: FraudStatus;
    currency: string;
  };

  type ApiResponse = {
    id: string;
    status_code: string;
    status_message: string;
  };

  class Snap {
    constructor(options: ConfigOptions);
    createTransaction(
      payload: CreateTransactionPayload
    ): Promise<TransactionResponse>;
  }

  class CoreApi {
    constructor(options: ConfigOptions);
    transaction: {
      status: (transactionId: string) => Promise<NotificationPayload>;
    };
  }

  class MidtransError extends Error {
    httpStatusCode: string | null;
    ApiResponse: ApiResponse | string | null;
    rawHttpClientData: Record<string, unknown> | null;
    constructor(
      message: string,
      httpStatusCode: string | null,
      ApiResponse: ApiResponse | string | null,
      rawHttpClientData: Record<string, unknown> | null
    );
  }
}
