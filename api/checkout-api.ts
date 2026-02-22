import { requestJson } from './http-client';

export interface CheckoutItemInput {
  storyId: number;
  quantity: number;
}

export interface CreateStripeCheckoutSessionInput {
  items: CheckoutItemInput[];
  customerEmail?: string;
}

export interface CreateStripeCheckoutSessionResult {
  sessionId: string;
  checkoutUrl: string;
  orderCode: string;
}

export interface StripeCheckoutSessionStatus {
  sessionId: string;
  status: string;
  paymentStatus: string;
  orderCode: string | null;
  amountTotal: number | null;
  currencyCode: string | null;
}

function withAuthHeader(accessToken?: string): HeadersInit | undefined {
  const token = accessToken?.trim();
  if (!token) {
    return undefined;
  }
  return {
    Authorization: `Bearer ${token}`,
  };
}

export const checkoutApi = {
  async createStripeCheckoutSession(
    input: CreateStripeCheckoutSessionInput,
    accessToken?: string,
  ): Promise<CreateStripeCheckoutSessionResult> {
    return requestJson<CreateStripeCheckoutSessionResult>('/checkout/stripe/session', {
      method: 'POST',
      headers: withAuthHeader(accessToken),
      body: JSON.stringify(input),
    });
  },

  async getStripeCheckoutSessionStatus(
    sessionId: string,
    accessToken?: string,
  ): Promise<StripeCheckoutSessionStatus> {
    return requestJson<StripeCheckoutSessionStatus>(
      `/checkout/stripe/session/${encodeURIComponent(sessionId)}`,
      {
        method: 'GET',
        headers: withAuthHeader(accessToken),
      },
    );
  },
};
