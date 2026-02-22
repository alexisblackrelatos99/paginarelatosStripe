import { requestJson } from './http-client';

interface BackendOrderLineResponse {
  storyId: number | string;
  storySlug: string;
  storyTitle: string;
  lineTotalInCents: number;
}

interface BackendOrderSummaryResponse {
  orderCode: string;
  purchasedAt: string;
  totalInCents: number;
  currencyCode: string;
  itemsCount: number;
  lines: BackendOrderLineResponse[];
}

export interface OrderLineRecord {
  storyId: string;
  storySlug: string;
  storyTitle: string;
  lineTotalInCents: number;
}

export interface OrderSummaryRecord {
  orderCode: string;
  purchasedAt: string;
  totalInCents: number;
  currencyCode: string;
  itemsCount: number;
  lines: OrderLineRecord[];
}

function normalizeLine(input: BackendOrderLineResponse): OrderLineRecord {
  return {
    storyId: String(input.storyId),
    storySlug: input.storySlug,
    storyTitle: input.storyTitle,
    lineTotalInCents: input.lineTotalInCents,
  };
}

function normalizeOrder(input: BackendOrderSummaryResponse): OrderSummaryRecord {
  return {
    orderCode: input.orderCode,
    purchasedAt: input.purchasedAt,
    totalInCents: input.totalInCents,
    currencyCode: input.currencyCode,
    itemsCount: input.itemsCount,
    lines: input.lines.map(normalizeLine),
  };
}

export const ordersApi = {
  async listOwnOrders(accessToken: string): Promise<OrderSummaryRecord[]> {
    const response = await requestJson<BackendOrderSummaryResponse[]>('/orders/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.map(normalizeOrder);
  },
};
