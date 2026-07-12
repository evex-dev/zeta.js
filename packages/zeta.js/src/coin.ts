import type { BaseClient } from "./core/client.ts";
import type { ApiResult } from "./core/types.ts";
import type {
  AmountResponse,
  AttemptsResponse,
  CoinAutoPaymentSettings,
  CoinBalance,
  CoinDailyRewardRequest,
  CoinDailyRewardResponse,
  CoinDepositDetail,
  CoinExpirationsResponse,
  CoinProductsResponse,
  CoinPurchaseRequest,
  CoinTransactionQuery,
  CoinTransactionsResponse,
  PaymentMethodResponse,
  StoreProductQuery,
  StorePurchaseResponse,
  StoreProductsResponse,
} from "./domainTypes.ts";
export class CoinApi {
  constructor(private readonly client: BaseClient) {}

  getBalance(): Promise<ApiResult<CoinBalance>> {
    return this.client.get<CoinBalance>("/v1/coin/balance");
  }

  listTransactions(query?: CoinTransactionQuery): Promise<ApiResult<CoinTransactionsResponse>> {
    return this.client.get<CoinTransactionsResponse>("/v1/coin/transactions", { query });
  }

  listExpirations(query?: CoinTransactionQuery): Promise<ApiResult<CoinExpirationsResponse>> {
    return this.client.get<CoinExpirationsResponse>("/v1/coin/expirations", { query });
  }

  getDepositDetail(transactionId: string): Promise<ApiResult<CoinDepositDetail>> {
    return this.client.get<CoinDepositDetail>("/v1/coin/deposits/:transactionId", { path: { transactionId } });
  }

  claimDailyReward(body?: CoinDailyRewardRequest): Promise<ApiResult<CoinDailyRewardResponse>> {
    return this.client.post<CoinDailyRewardResponse, CoinDailyRewardRequest | undefined>("/v1/coin/daily-rewards", body);
  }

  getDailyRewardLeftAttempts(): Promise<ApiResult<AttemptsResponse>> {
    return this.client.get<AttemptsResponse>("/v1/coin/daily-rewards/left-attempts");
  }

  getDailyRewardAmount(): Promise<ApiResult<AmountResponse>> {
    return this.client.get<AmountResponse>("/v1/coin/daily-rewards/amount");
  }

  getAutoPaymentSettings(): Promise<ApiResult<CoinAutoPaymentSettings>> {
    return this.client.get<CoinAutoPaymentSettings>("/v1/coin/auto-payment/settings");
  }

  createAutoPaymentSettings(body?: CoinAutoPaymentSettings): Promise<ApiResult<CoinAutoPaymentSettings>> {
    return this.client.post<CoinAutoPaymentSettings, CoinAutoPaymentSettings | undefined>("/v1/coin/auto-payment/settings", body);
  }

  updateAutoPaymentSettings(body?: CoinAutoPaymentSettings): Promise<ApiResult<CoinAutoPaymentSettings>> {
    return this.client.patch<CoinAutoPaymentSettings, CoinAutoPaymentSettings | undefined>("/v1/coin/auto-payment/settings", body);
  }

  deleteAutoPaymentSettings(): Promise<ApiResult<unknown>> {
    return this.client.delete("/v1/coin/auto-payment/settings");
  }

  getAutoPaymentMethod(): Promise<ApiResult<PaymentMethodResponse>> {
    return this.client.get<PaymentMethodResponse>("/v1/coin/auto-payment/settings/payment-method");
  }

  listCoinProducts(query?: StoreProductQuery): Promise<ApiResult<CoinProductsResponse>> {
    return this.client.get<CoinProductsResponse>("/v1/coin-products", { query });
  }

  purchaseCoinProduct(productId: string, body?: CoinPurchaseRequest): Promise<ApiResult<StorePurchaseResponse>> {
    return this.client.post<StorePurchaseResponse, CoinPurchaseRequest | undefined>("/v1/coin-products/:productId/purchases", body, { path: { productId } });
  }

  listOpenStoreProducts(storeType: string, query?: StoreProductQuery): Promise<ApiResult<StoreProductsResponse>> {
    return this.client.get<StoreProductsResponse>("/v1/open-stores/:storeType/products", { path: { storeType }, query });
  }

  purchaseOpenStoreProduct(storeType: string, productId: string, body?: CoinPurchaseRequest): Promise<ApiResult<StorePurchaseResponse>> {
    return this.client.post<StorePurchaseResponse, CoinPurchaseRequest | undefined>("/v1/open-stores/:storeType/products/:productId/purchases", body, { path: { storeType, productId } });
  }

  updateOpenStorePurchase(storeType: string, body?: CoinPurchaseRequest): Promise<ApiResult<StorePurchaseResponse>> {
    return this.client.put<StorePurchaseResponse, CoinPurchaseRequest | undefined>("/v1/open-stores/:storeType/purchases", body, { path: { storeType } });
  }
}

export function createCoinApi(client: BaseClient): CoinApi {
  return new CoinApi(client);
}
