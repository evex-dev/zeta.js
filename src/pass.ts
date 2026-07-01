import type { BaseClient } from "./core/client.ts";
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

  getSubscription() {
    return this.client.get<ZetaPassSubscription>("/v1/zeta-pass/subscription");
  }

  getPaymentMethod() {
    return this.client.get<ZetaPassPaymentMethod>("/v1/zeta-pass/payment-method");
  }

  updatePaymentMethod(body?: ZetaPassPaymentMethodRequest) {
    return this.client.put<ZetaPassPaymentMethod, ZetaPassPaymentMethodRequest | undefined>("/v1/zeta-pass/payment-method", body);
  }

  subscribePlayStore(body?: ZetaPassStoreSubscribeRequest) {
    return this.client.post<ZetaPassSubscription>("/v1/zeta-pass/subscribe/play-store", body);
  }

  subscribeAppStore(body?: ZetaPassStoreSubscribeRequest) {
    return this.client.post<ZetaPassSubscription>("/v1/zeta-pass/subscribe/app-store", body);
  }

  subscribeBrandpay(body?: ZetaPassBrandpaySubscribeRequest) {
    return this.client.post<ZetaPassSubscription>("/v1/zeta-pass/subscribe/brandpay", body);
  }

  consentPromotionBrandpay(body?: ZetaPassBrandpaySubscribeRequest) {
    return this.client.post<ZetaPassSubscription>("/v1/zeta-pass/subscribe/promotion/brandpay/consent", body);
  }

  cancelSubscription(body?: ZetaPassCancelRequest) {
    return this.client.post<ZetaPassSubscription>("/v1/zeta-pass/cancel", body);
  }

  reactivateSubscription() {
    return this.client.post<ZetaPassSubscription>("/v1/zeta-pass/reactivate");
  }

  refundSubscription(body?: ZetaPassRefundRequest) {
    return this.client.post<ZetaPassRefundResult>("/v1/zeta-pass/refund", body);
  }

  getRefundEligibility(query?: EligibilityQuery) {
    return this.client.get<ZetaPassEligibilityResponse>("/v1/zeta-pass/refund/eligibility", { query });
  }

  remindRenewal() {
    return this.client.post<ZetaPassSubscription>("/v1/zeta-pass/renewal-reminder");
  }

  getPromotionEligibility(query?: EligibilityQuery) {
    return this.client.get<ZetaPassEligibilityResponse>("/v1/zeta-pass/promotion/eligibility", { query });
  }

  getProConversionStatus(query?: EligibilityQuery) {
    return this.client.get<ZetaPassProConversionStatus>("/v1/zeta-pass/pro-conversion/status", { query });
  }

  getProConversionPreview(query?: EligibilityQuery) {
    return this.client.get<ZetaPassProConversionPreview>("/v1/zeta-pass/pro-conversion/preview", { query });
  }

  convertProConversion() {
    return this.client.post<ZetaPassProConversionStatus>("/v1/zeta-pass/pro-conversion/convert");
  }

  getProConversion(query?: EligibilityQuery) {
    return this.client.get<ZetaPassProConversionStatus>("/v1/zeta-pass/pro-conversion/status", { query });
  }

  purchaseOneDayPass(body?: ZetaPassOneDayPassPurchaseRequest) {
    return this.client.post<ZetaPassWebOrder, ZetaPassOneDayPassPurchaseRequest | undefined>("/v1/zeta-pass/one-day-pass/purchase/web/orders", body);
  }

  createOneDayPassWebOrder(body?: ZetaPassWebOrderRequest) {
    return this.client.post<ZetaPassWebOrder, ZetaPassWebOrderRequest | undefined>("/v1/zeta-pass/one-day-pass/purchase/web/orders", body);
  }

  confirmOneDayPassWebOrder(body?: ZetaPassOneDayPassConfirmationRequest) {
    return this.client.post<ZetaPassWebOrder, ZetaPassOneDayPassConfirmationRequest | undefined>("/v1/zeta-pass/one-day-pass/purchase/web/confirmations", body);
  }

  purchaseOneDayPassPlayStore(body?: ZetaPassStoreSubscribeRequest) {
    return this.client.post<ZetaPassSubscription, ZetaPassStoreSubscribeRequest | undefined>("/v1/zeta-pass/one-day-pass/purchase/play-store", body);
  }

  purchaseOneDayPassAppStore(body?: ZetaPassStoreSubscribeRequest) {
    return this.client.post<ZetaPassSubscription, ZetaPassStoreSubscribeRequest | undefined>("/v1/zeta-pass/one-day-pass/purchase/app-store", body);
  }

  refundOneDayPass(body?: ZetaPassRefundRequest) {
    return this.client.post<ZetaPassRefundResult, ZetaPassRefundRequest | undefined>("/v1/zeta-pass/one-day-pass/refund", body);
  }

  getOneDayPassRefundEligibility(query?: EligibilityQuery) {
    return this.client.get<ZetaPassEligibilityResponse>("/v1/zeta-pass/one-day-pass/refund/eligibility", { query });
  }

  listWebOrders(query?: WebOrderListQuery) {
    return this.client.get<ZetaPassWebOrdersResponse>("/v1/zeta-pass/web/orders", { query });
  }

  createWebOrder(body?: ZetaPassWebOrderRequest) {
    return this.client.post<ZetaPassWebOrder, ZetaPassWebOrderRequest | undefined>("/v1/zeta-pass/web/orders", body);
  }

  getWebOrder(orderId: string) {
    return this.client.get<ZetaPassWebOrder>("/v1/zeta-pass/web/orders/:orderId", { path: { orderId } });
  }

  getSubscriptionStatus() {
    return this.client.get<SubscriptionStatusResponse>("/v1/subscriptions/status/");
  }

  getSubscriptionEntitlements() {
    return this.client.get<SubscriptionEntitlementsResponse>("/v1/subscriptions/entitlements/");
  }

  bindSubscriptionUser(body?: SubscriptionBindUserRequest) {
    return this.client.post("/v1/subscriptions/bind-user/", body);
  }

  listTossPaymentMethods() {
    return this.client.get<TossPaymentMethodsResponse>("/v1/toss-payments/payment-methods");
  }

  createTossPaymentOrder(body?: TossPaymentOrderRequest) {
    return this.client.post<TossPaymentOrderResponse, TossPaymentOrderRequest | undefined>("/v1/toss-payments/orders", body);
  }

  confirmTossPayment(body?: TossPaymentConfirmationRequest) {
    return this.client.post<TossPaymentOrderResponse, TossPaymentConfirmationRequest | undefined>("/v1/toss-payments/confirmations", body);
  }

  cancelTossPayment(body?: TossPaymentCancellationRequest) {
    return this.client.post<TossPaymentOrderResponse, TossPaymentCancellationRequest | undefined>("/v1/toss-payments/cancellations", body);
  }
}

export function createPassApi(client: BaseClient): PassApi {
  return new PassApi(client);
}
