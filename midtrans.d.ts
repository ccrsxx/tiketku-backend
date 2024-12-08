declare module 'midtrans-client' {
  interface ConfigOptions {
    isProduction?: boolean;
    serverKey: string;
    clientKey: string;
  }

  interface ChargePayload {
    // payment_type: string;
    transaction_details: {
      order_id: string;
      gross_amount: number;
    };
    customer_details?: {
      first_name?: string;
      last_name?: string;
      email?: string;
      phone?: string;
    };
  }

  interface TransactionResponse {
    status_code: string;
    status_message: string;
    transaction_id?: string;
    order_id: string;
    redirect_url?: string;
    token?: string;
  }

  class Snap {
    constructor(options: ConfigOptions);
    createTransaction(payload: ChargePayload): Promise<TransactionResponse>;
  }

  class Core {
    constructor(options: ConfigOptions);
    charge(payload: ChargePayload): Promise<TransactionResponse>;
  }

  export { Snap, Core, ConfigOptions, ChargePayload, TransactionResponse };

  const midtransClient: {
    Snap: typeof Snap;
    Core: typeof Core;
  };

  export default midtransClient;
}
