import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Price } from '@/components/commerce/price';
import { useCart } from '@/contexts/cart-context';
import { useAuth } from '@/contexts/auth-context';
import { checkoutApi } from '../../api/checkout-api';
import { ApiError } from '../../api/http-client';

function checkoutErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.code) {
      case 'VALIDATION_ERROR':
        return 'No se pudo procesar tu carrito. Revisa los relatos seleccionados.';
      case 'AMOUNT_TOO_SMALL':
        return 'El importe minimo de Stripe para USD es 0.50. Aumenta el total del carrito.';
      case 'STORY_NOT_FOUND':
        return 'Uno de los relatos ya no esta disponible.';
      case 'STORY_ALREADY_PURCHASED':
        return 'Tu carrito incluye relatos que ya compraste. Eliminalos para continuar.';
      case 'STRIPE_NOT_CONFIGURED':
        return 'El sistema de pago no esta configurado.';
      case 'PAYMENT_PROVIDER_ERROR':
        return 'No se pudo iniciar el pago en Stripe. Intentalo de nuevo.';
      case 'HTTP_401':
      case 'HTTP_403':
        return 'Tu sesion expiro. Inicia sesion otra vez para continuar.';
      default:
        return `No se pudo iniciar el pago (${error.code}).`;
    }
  }

  if (error instanceof Error && error.message === 'INVALID_STORY_ID') {
    return 'Hay un relato invalido en el carrito. Eliminalo e intentalo de nuevo.';
  }

  return 'No se pudo iniciar el pago.';
}

export function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const { activeOrder } = useCart();
  const { activeCustomer } = useAuth();
  const [isSubmittingCheckout, setIsSubmittingCheckout] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const hasAutoStartedRef = useRef(false);

  const paymentCancelled = searchParams.get('payment') === 'cancelled';

  if (!activeCustomer) {
    return (
      <div className="container mx-auto px-4 py-20">
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Inicia sesion para pagar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Para guardar tus compras en tu biblioteca necesitas completar el pago con tu cuenta iniciada.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/sign-in?redirectTo=/checkout">Iniciar sesion</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/register?redirectTo=/checkout">Crear cuenta</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (activeOrder.lines.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20">
        <h1 className="mb-4 text-3xl font-bold">Pago</h1>
        <p className="mb-6 text-muted-foreground">Tu carrito esta vacio. Agrega relatos para continuar.</p>
        <Button asChild>
          <Link to="/cart">Ir al carrito</Link>
        </Button>
      </div>
    );
  }

  const handleCheckout = useCallback(async () => {
    if (!activeCustomer) {
      return;
    }

    setCheckoutError(null);
    setIsSubmittingCheckout(true);

    try {
      const items = activeOrder.lines.map((line) => {
        const storyId = Number.parseInt(line.productVariant.product.id, 10);
        if (!Number.isInteger(storyId) || storyId <= 0) {
          throw new Error('INVALID_STORY_ID');
        }

        return {
          storyId,
          quantity: line.quantity,
        };
      });

      const response = await checkoutApi.createStripeCheckoutSession(
        {
          items,
          customerEmail: activeCustomer.emailAddress,
        },
        activeCustomer.accessToken,
      );

      window.location.assign(response.checkoutUrl);
    } catch (error) {
      setCheckoutError(checkoutErrorMessage(error));
      setIsSubmittingCheckout(false);
    }
  }, [activeCustomer, activeOrder.lines]);

  useEffect(() => {
    if (
      !activeCustomer ||
      activeOrder.lines.length === 0 ||
      paymentCancelled ||
      isSubmittingCheckout ||
      hasAutoStartedRef.current
    ) {
      return;
    }

    hasAutoStartedRef.current = true;
    void handleCheckout();
  }, [activeCustomer, activeOrder.lines.length, handleCheckout, isSubmittingCheckout, paymentCancelled]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Pago</h1>

      {paymentCancelled && (
        <Card className="mb-6 border-amber-300">
          <CardHeader>
            <CardTitle>Pago cancelado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Cancelaste el pago en Stripe. Tu carrito sigue guardado.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Relatos a comprar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeOrder.lines.map((line) => (
                <div key={line.id} className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{line.productVariant.product.name}</p>
                  </div>
                  <p className="text-sm font-medium">
                    <Price value={line.linePriceWithTax} currencyCode={activeOrder.currencyCode} />
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Total</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>
                    <Price value={activeOrder.subTotalWithTax} currencyCode={activeOrder.currencyCode} />
                  </span>
                </div>

                {activeOrder.discounts.map((discount) => (
                  <div key={discount.description} className="flex justify-between text-sm text-green-600">
                    <span>{discount.description}</span>
                    <span>
                      <Price value={discount.amountWithTax} currencyCode={activeOrder.currencyCode} />
                    </span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>
                  <Price value={activeOrder.totalWithTax} currencyCode={activeOrder.currencyCode} />
                </span>
              </div>

              {checkoutError && <p className="text-sm text-destructive">{checkoutError}</p>}

              <Button
                className="w-full"
                size="lg"
                onClick={handleCheckout}
                disabled={isSubmittingCheckout && !checkoutError && !paymentCancelled}
              >
                {isSubmittingCheckout && !checkoutError && !paymentCancelled
                  ? 'Redirigiendo a Stripe...'
                  : 'Pagar con Stripe'}
              </Button>

              <Button asChild variant="outline" className="w-full">
                <Link to="/cart">Volver al carrito</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
