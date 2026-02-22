import { createContext, useContext, useMemo, useState } from 'react';
import type { CatalogProduct, ProductVariant } from '@/data/catalog';

interface OrderLine {
  id: string;
  quantity: number;
  unitPriceWithTax: number;
  linePriceWithTax: number;
  productVariant: {
    id: string;
    name: string;
    sku: string;
    product: {
      id: string;
      name: string;
      slug: string;
      featuredAsset: {
        preview: string;
      } | null;
    };
  };
}

export interface ActiveOrder {
  id: string;
  code: string;
  currencyCode: string;
  lines: OrderLine[];
  subTotalWithTax: number;
  totalWithTax: number;
  discounts: Array<{
    description: string;
    amountWithTax: number;
  }>;
}

export interface LastOrder {
  code: string;
  order: ActiveOrder;
  placedAt: string;
}

interface CartStateLine {
  id: string;
  product: CatalogProduct;
  variant: ProductVariant;
  quantity: number;
}

interface CartContextValue {
  activeOrder: ActiveOrder;
  lastOrder: LastOrder | null;
  cartItemCount: number;
  addToCart: (product: CatalogProduct, variant: ProductVariant, quantity?: number) => void;
  removeFromCart: (lineId: string) => void;
  placeOrder: (orderCode?: string) => string;
  getPlacedOrderByCode: (code: string) => LastOrder | null;
}

const CartContext = createContext<CartContextValue | null>(null);

const USD_DISCOUNT_THRESHOLD_10 = 500;
const USD_DISCOUNT_THRESHOLD_15 = 1000;

function getAutomaticDiscountRate(subTotalWithTax: number, currencyCode: string): number {
  if (currencyCode !== 'USD') {
    return 0;
  }

  if (subTotalWithTax > USD_DISCOUNT_THRESHOLD_15) {
    return 0.15;
  }

  if (subTotalWithTax > USD_DISCOUNT_THRESHOLD_10) {
    return 0.1;
  }

  return 0;
}

function buildActiveOrder(lines: CartStateLine[]): ActiveOrder {
  const currencyCode = 'USD';
  const normalizedLines: OrderLine[] = lines.map((line) => ({
    id: line.id,
    quantity: 1,
    unitPriceWithTax: line.variant.priceWithTax,
    linePriceWithTax: line.variant.priceWithTax,
    productVariant: {
      id: line.variant.id,
      name: line.variant.name,
      sku: line.variant.sku,
      product: {
        id: line.product.id,
        name: line.product.name,
        slug: line.product.slug,
        featuredAsset: line.product.featuredAsset
          ? {
              preview: line.product.featuredAsset.preview,
            }
          : null,
      },
    },
  }));

  const subTotalWithTax = normalizedLines.reduce((total, line) => total + line.linePriceWithTax, 0);
  const discountRate = getAutomaticDiscountRate(subTotalWithTax, currencyCode);
  const discountAmountWithTax = discountRate > 0 ? -Math.round(subTotalWithTax * discountRate) : 0;
  const discounts: ActiveOrder['discounts'] =
    discountAmountWithTax < 0
      ? [
          {
            description: discountRate === 0.15 ? 'Descuento automatico 15%' : 'Descuento automatico 10%',
            amountWithTax: discountAmountWithTax,
          },
        ]
      : [];

  const discountTotal = discounts.reduce((total, discount) => total + discount.amountWithTax, 0);

  return {
    id: 'active-order',
    code: 'DEMO-CART',
    currencyCode,
    lines: normalizedLines,
    subTotalWithTax,
    discounts,
    totalWithTax: subTotalWithTax + discountTotal,
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartStateLine[]>([]);
  const [lastOrder, setLastOrder] = useState<LastOrder | null>(null);

  const activeOrder = useMemo(() => buildActiveOrder(lines), [lines]);

  const cartItemCount = useMemo(() => lines.length, [lines]);

  const value = useMemo<CartContextValue>(
    () => ({
      activeOrder,
      lastOrder,
      cartItemCount,
      addToCart(product, variant) {
        setLines((previousLines) => {
          const existingLine = previousLines.find((line) => line.product.id === product.id);

          if (existingLine) {
            return previousLines;
          }

          return [
            ...previousLines,
            {
              id: `line-${product.id}`,
              product,
              variant,
              quantity: 1,
            },
          ];
        });
      },
      removeFromCart(lineId) {
        setLines((previousLines) => previousLines.filter((line) => line.id !== lineId));
      },
      placeOrder(orderCodeInput) {
        const orderCode = orderCodeInput?.trim() || `DEMO-${Math.floor(1000 + Math.random() * 9000)}`;

        setLastOrder({
          code: orderCode,
          order: {
            ...activeOrder,
            code: orderCode,
          },
          placedAt: new Date().toISOString(),
        });

        setLines([]);

        return orderCode;
      },
      getPlacedOrderByCode(code) {
        if (!lastOrder) {
          return null;
        }

        return lastOrder.code === code ? lastOrder : null;
      },
    }),
    [activeOrder, cartItemCount, lastOrder],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }

  return context;
}
