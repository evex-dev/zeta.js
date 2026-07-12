import type { BaseClient } from "./core/client.ts";
import type { ApiResult } from "./core/types.ts";
import type {
  EligibilityQuery,
  SubscriptionBindUserRequest,
  SubscriptionEntitlementsResponse,
  SubscriptionStatusResponse,
  TossPaymentCancellationRequest,
  TossPaymentConfirmationRequest,
  TossPaymentMethodsResponse,
  TossPaymentOrderRequest,
  TossPaymentOrderResponse,
  WebOrderListQuery,
  ZetaPassBrandpaySubscribeRequest,
  ZetaPassCancelRequest,
  ZetaPassEligibilityResponse,
  ZetaPassOneDayPassConfirmationRequest,
  ZetaPassOneDayPassPurchaseRequest,
  ZetaPassPaymentMethod,
  ZetaPassPaymentMethodRequest,
  ZetaPassProConversionPreview,
  ZetaPassProConversionStatus,
  ZetaPassRefundRequest,
  ZetaPassRefundResult,
  ZetaPassStoreSubscribeRequest,
  ZetaPassSubscription,
  ZetaPassWebOrder,
  ZetaPassWebOrderRequest,
  ZetaPassWebOrdersResponse,
} from "./domainTypes.ts";
export class PassApi {
  constructor(private readonly client: BaseClient) {}

  getSubscription(): Promise<ApiResult<ZetaPassSubscription>> {
    return this.client.get<ZetaPassSubscription>("/v1/zeta-pass/subscription");
  }

  getPaymentMethod(): Promise<ApiResult<ZetaPassPaymentMethod>> {
    return this.client.get<ZetaPassPaymentMethod>("/v1/zeta-pass/payment-method");
  }

  updatePaymentMethod(body?: ZetaPassPaymentMethodRequest): Promise<ApiResult<ZetaPassPaymentMethod>> {
    return this.client.put<ZetaPassPaymentMethod, ZetaPassPaymentMethodRequest | undefined>("/v1/zeta-pass/payment-method", body);
  }

  subscribePlayStore(body?: ZetaPassStoreSubscribeRequest): Promise<ApiResult<ZetaPassSubscription>> {
    return this.client.post<ZetaPassSubscription>("/v1/zeta-pass/subscribe/play-store", body);
  }

  subscribeAppStore(body?: ZetaPassStoreSubscribeRequest): Promise<ApiResult<ZetaPassSubscription>> {
    return this.client.post<ZetaPassSubscription>("/v1/zeta-pass/subscribe/app-store", body);
  }

  subscribeBrandpay(body?: ZetaPassBrandpaySubscribeRequest): Promise<ApiResult<ZetaPassSubscription>> {
    return this.client.post<ZetaPassSubscription>("/v1/zeta-pass/subscribe/brandpay", body);
  }

  consentPromotionBrandpay(body?: ZetaPassBrandpaySubscribeRequest): Promise<ApiResult<ZetaPassSubscription>> {
    return this.client.post<ZetaPassSubscription>("/v1/zeta-pass/subscribe/promotion/brandpay/consent", body);
  }

  cancelSubscription(body?: ZetaPassCancelRequest): Promise<ApiResult<ZetaPassSubscription>> {
    return this.client.post<ZetaPassSubscription>("/v1/zeta-pass/cancel", body);
  }

  reactivateSubscription(): Promise<ApiResult<ZetaPassSubscription>> {
    return this.client.post<ZetaPassSubscription>("/v1/zeta-pass/reactivate");
  }

  refundSubscription(body?: ZetaPassRefundRequest): Promise<ApiResult<ZetaPassRefundResult>> {
    return this.client.post<ZetaPassRefundResult>("/v1/zeta-pass/refund", body);
  }

  getRefundEligibility(query?: EligibilityQuery): Promise<ApiResult<ZetaPassEligibilityResponse>> {
    return this.client.get<ZetaPassEligibilityResponse>("/v1/zeta-pass/refund/eligibility", { query });
  }

  remindRenewal(): Promise<ApiResult<ZetaPassSubscription>> {
    return this.client.post<ZetaPassSubscription>("/v1/zeta-pass/renewal-reminder");
  }

  getPromotionEligibility(query?: EligibilityQuery): Promise<ApiResult<ZetaPassEligibilityResponse>> {
    return this.client.get<ZetaPassEligibilityResponse>("/v1/zeta-pass/promotion/eligibility", { query });
  }

  getProConversionStatus(query?: EligibilityQuery): Promise<ApiResult<ZetaPassProConversionStatus>> {
    return this.client.get<ZetaPassProConversionStatus>("/v1/zeta-pass/pro-conversion/status", { query });
  }

  getProConversionPreview(query?: EligibilityQuery): Promise<ApiResult<ZetaPassProConversionPreview>> {
    return this.client.get<ZetaPassProConversionPreview>("/v1/zeta-pass/pro-conversion/preview", { query });
  }

  convertProConversion(): Promise<ApiResult<ZetaPassProConversionStatus>> {
    return this.client.post<ZetaPassProConversionStatus>("/v1/zeta-pass/pro-conversion/convert");
  }

  getProConversion(query?: EligibilityQuery): Promise<ApiResult<ZetaPassProConversionStatus>> {
    return this.client.get<ZetaPassProConversionStatus>("/v1/zeta-pass/pro-conversion/status", { query });
  }

  purchaseOneDayPass(body?: ZetaPassOneDayPassPurchaseRequest): Promise<ApiResult<ZetaPassWebOrder>> {
    return this.client.post<ZetaPassWebOrder, ZetaPassOneDayPassPurchaseRequest | undefined>("/v1/zeta-pass/one-day-pass/purchase/web/orders", body);
  }

  createOneDayPassWebOrder(body?: ZetaPassWebOrderRequest): Promise<ApiResult<ZetaPassWebOrder>> {
    return this.client.post<ZetaPassWebOrder, ZetaPassWebOrderRequest | undefined>("/v1/zeta-pass/one-day-pass/purchase/web/orders", body);
  }

  confirmOneDayPassWebOrder(body?: ZetaPassOneDayPassConfirmationRequest): Promise<ApiResult<ZetaPassWebOrder>> {
    return this.client.post<ZetaPassWebOrder, ZetaPassOneDayPassConfirmationRequest | undefined>("/v1/zeta-pass/one-day-pass/purchase/web/confirmations", body);
  }

  purchaseOneDayPassPlayStore(body?: ZetaPassStoreSubscribeRequest): Promise<ApiResult<ZetaPassSubscription>> {
    return this.client.post<ZetaPassSubscription, ZetaPassStoreSubscribeRequest | undefined>("/v1/zeta-pass/one-day-pass/purchase/play-store", body);
  }

  purchaseOneDayPassAppStore(body?: ZetaPassStoreSubscribeRequest): Promise<ApiResult<ZetaPassSubscription>> {
    return this.client.post<ZetaPassSubscription, ZetaPassStoreSubscribeRequest | undefined>("/v1/zeta-pass/one-day-pass/purchase/app-store", body);
  }

  refundOneDayPass(body?: ZetaPassRefundRequest): Promise<ApiResult<ZetaPassRefundResult>> {
    return this.client.post<ZetaPassRefundResult, ZetaPassRefundRequest | undefined>("/v1/zeta-pass/one-day-pass/refund", body);
  }

  getOneDayPassRefundEligibility(query?: EligibilityQuery): Promise<ApiResult<ZetaPassEligibilityResponse>> {
    return this.client.get<ZetaPassEligibilityResponse>("/v1/zeta-pass/one-day-pass/refund/eligibility", { query });
  }

  listWebOrders(query?: WebOrderListQuery): Promise<ApiResult<ZetaPassWebOrdersResponse>> {
    return this.client.get<ZetaPassWebOrdersResponse>("/v1/zeta-pass/web/orders", { query });
  }

  createWebOrder(body?: ZetaPassWebOrderRequest): Promise<ApiResult<ZetaPassWebOrder>> {
    return this.client.post<ZetaPassWebOrder, ZetaPassWebOrderRequest | undefined>("/v1/zeta-pass/web/orders", body);
  }

  getWebOrder(orderId: string): Promise<ApiResult<ZetaPassWebOrder>> {
    return this.client.get<ZetaPassWebOrder>("/v1/zeta-pass/web/orders/:orderId", { path: { orderId } });
  }

  getSubscriptionStatus(): Promise<ApiResult<SubscriptionStatusResponse>> {
    return this.client.get<SubscriptionStatusResponse>("/v1/subscriptions/status/");
  }

  getSubscriptionEntitlements(): Promise<ApiResult<SubscriptionEntitlementsResponse>> {
    return this.client.get<SubscriptionEntitlementsResponse>("/v1/subscriptions/entitlements/");
  }

  bindSubscriptionUser(body?: SubscriptionBindUserRequest): Promise<ApiResult<unknown>> {
    return this.client.post("/v1/subscriptions/bind-user/", body);
  }

  listTossPaymentMethods(): Promise<ApiResult<TossPaymentMethodsResponse>> {
    return this.client.get<TossPaymentMethodsResponse>("/v1/toss-payments/payment-methods");
  }

  createTossPaymentOrder(body?: TossPaymentOrderRequest): Promise<ApiResult<TossPaymentOrderResponse>> {
    return this.client.post<TossPaymentOrderResponse, TossPaymentOrderRequest | undefined>("/v1/toss-payments/orders", body);
  }

  confirmTossPayment(body?: TossPaymentConfirmationRequest): Promise<ApiResult<TossPaymentOrderResponse>> {
    return this.client.post<TossPaymentOrderResponse, TossPaymentConfirmationRequest | undefined>("/v1/toss-payments/confirmations", body);
  }

  cancelTossPayment(body?: TossPaymentCancellationRequest): Promise<ApiResult<TossPaymentOrderResponse>> {
    return this.client.post<TossPaymentOrderResponse, TossPaymentCancellationRequest | undefined>("/v1/toss-payments/cancellations", body);
  }
}

export function createPassApi(client: BaseClient): PassApi {
  return new PassApi(client);
}
