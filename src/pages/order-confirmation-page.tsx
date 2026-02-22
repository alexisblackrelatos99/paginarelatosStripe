import { useEffect, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Price } from '@/components/commerce/price';
import { useCart } from '@/contexts/cart-context';
import { useAuth } from '@/contexts/auth-context';
import { checkoutApi } from '../../api/checkout-api';
import { ApiError } from '../../api/http-client';

function sessionStatusErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.code) {
      case 'CHECKOUT_SESSION_NOT_FOUND':
        return 'No se pudo validar el pago. Vuelve a intentarlo desde el carrito.';
      case 'STRIPE_NOT_CONFIGURED':
        return 'El sistema de pagos no esta configurado.';
      case 'PAYMENT_PROVIDER_ERROR':
        return 'No se pudo verificar el pago en Stripe.';
      case 'HTTP_401':
      case 'HTTP_403':
        return 'Tu sesion expiro. Inicia sesion para validar tu compra.';
      default:
        return 'No se pudo confirmar el pago.';
    }
  }

  return 'No se pudo confirmar el pago.';
}

function fallbackStripeOrderCode(sessionId: string): string {
  return `STRIPE-${sessionId.slice(-10).toUpperCase()}`;
}

export function OrderConfirmationPage() {
  const { code = '' } = useParams<{ code: string }>();
  const [searchParams] = useSearchParams();
  const stripeSessionId = searchParams.get('session_id')?.trim() ?? '';
  const isStripeFlow = code === 'stripe' && stripeSessionId.length > 0;

  const { activeOrder, getPlacedOrderByCode, placeOrder } = useCart();
  const { activeCustomer } = useAuth();

  const [resolvedCode, setResolvedCode] = useState(code);
  const [isCheckingStripePayment, setIsCheckingStripePayment] = useState(isStripeFlow);
  const [stripeMessage, setStripeMessage] = useState<string | null>(null);
  const [isStripePaid, setIsStripePaid] = useState(!isStripeFlow);
  const verifiedSessionRef = useRef<string | null>(null);

  useEffect(() => {
    setResolvedCode(code);
    setStripeMessage(null);
    setIsStripePaid(!isStripeFlow);
    setIsCheckingStripePayment(isStripeFlow);
  }, [code, isStripeFlow]);

  useEffect(() => {
    if (!isStripeFlow) {
      return;
    }

    if (!activeCustomer?.accessToken) {
      setIsCheckingStripePayment(false);
      setIsStripePaid(false);
      setStripeMessage('Inicia sesion para confirmar la compra y acceder a tu biblioteca.');
      return;
    }

    if (verifiedSessionRef.current === stripeSessionId) {
      return;
    }
    verifiedSessionRef.current = stripeSessionId;

    let cancelled = false;

    const run = async () => {
      setIsCheckingStripePayment(true);
      setStripeMessage(null);

      try {
        const session = await checkoutApi.getStripeCheckoutSessionStatus(
          stripeSessionId,
          activeCustomer.accessToken,
        );

        if (cancelled) {
          return;
        }

        if (session.paymentStatus !== 'paid') {
          setIsStripePaid(false);
          setStripeMessage('Tu pago aun no figura como completado.');
          return;
        }

        setIsStripePaid(true);
        const nextCode = session.orderCode?.trim() || fallbackStripeOrderCode(stripeSessionId);
        setResolvedCode(nextCode);

        if (!getPlacedOrderByCode(nextCode) && activeOrder.lines.length > 0) {
          placeOrder(nextCode);
        }
      } catch (error) {
        if (cancelled) {
          return;
        }
        setIsStripePaid(false);
        setStripeMessage(sessionStatusErrorMessage(error));
      } finally {
        if (!cancelled) {
          setIsCheckingStripePayment(false);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [
    activeCustomer?.accessToken,
    activeOrder.lines.length,
    getPlacedOrderByCode,
    isStripeFlow,
    placeOrder,
    stripeSessionId,
  ]);

  const placedOrder = getPlacedOrderByCode(resolvedCode);

  const title = isStripeFlow
    ? isCheckingStripePayment
      ? 'Verificando pago'
      : isStripePaid
        ? 'Pago confirmado'
        : 'No se pudo confirmar el pago'
    : 'Pedido confirmado';

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-green-500" />
          <h1 className="mb-2 text-3xl font-bold">{title}</h1>
          {!isStripeFlow && (
            <p className="text-muted-foreground">
              Gracias por tu compra. Tu numero de pedido es <span className="font-semibold">{resolvedCode}</span>
            </p>
          )}
        </div>

        {isCheckingStripePayment ? (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Confirmando tu pago</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Estamos validando tu pago en Stripe.</p>
            </CardContent>
          </Card>
        ) : placedOrder ? (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Resumen del pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {placedOrder.order.lines.map((line) => (
                <div key={line.id} className="flex items-center gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{line.productVariant.product.name}</p>
                  </div>
                  <div className="w-24 text-right">
                    <p className="font-semibold">
                      <Price value={line.linePriceWithTax} currencyCode={placedOrder.order.currencyCode} />
                    </p>
                  </div>
                </div>
              ))}

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>
                  <Price value={placedOrder.order.totalWithTax} currencyCode={placedOrder.order.currencyCode} />
                </span>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{isStripeFlow ? 'Estado de la compra' : 'Detalles no disponibles'}</CardTitle>
            </CardHeader>
            <CardContent>
              {stripeMessage ? (
                <p className="text-sm text-destructive">{stripeMessage}</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Tu pago fue confirmado. Tus relatos comprados apareceran en tu biblioteca.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        <div className="flex flex-wrap gap-3">
          <Button asChild className="flex-1">
            <Link to="/collection/biblioteca">Ir a mi biblioteca</Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link to="/">Seguir comprando</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
