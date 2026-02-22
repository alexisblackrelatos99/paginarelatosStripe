import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Price } from '@/components/commerce/price';
import { useAuth } from '@/contexts/auth-context';
import { ordersApi, type OrderSummaryRecord } from '../../api/orders-api';
import { ApiError } from '../../api/http-client';

function ordersErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.code) {
      case 'HTTP_401':
      case 'HTTP_403':
        return 'Tu sesion expiro. Inicia sesion nuevamente.';
      default:
        return `No se pudieron cargar tus pedidos (${error.code}).`;
    }
  }

  return 'No se pudieron cargar tus pedidos.';
}

export function AccountOrdersPage() {
  const { activeCustomer } = useAuth();
  const [orders, setOrders] = useState<OrderSummaryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const accessToken = activeCustomer?.accessToken?.trim();
    if (!accessToken) {
      setOrders([]);
      setErrorMessage('Inicia sesion para ver tus pedidos.');
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const run = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await ordersApi.listOwnOrders(accessToken);
        if (cancelled) {
          return;
        }
        setOrders(response);
      } catch (error) {
        if (cancelled) {
          return;
        }
        setOrders([]);
        setErrorMessage(ordersErrorMessage(error));
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [activeCustomer?.accessToken]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tus pedidos</CardTitle>
          <CardDescription>Cargando historial de compras...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (errorMessage) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tus pedidos</CardTitle>
          <CardDescription>{errorMessage}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tus pedidos</CardTitle>
          <CardDescription>Aun no has realizado ningun pedido.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link to="/">Empezar a comprar</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tus pedidos</CardTitle>
        <CardDescription>Historial completo de tus compras.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {orders.map((order) => (
          <div key={order.orderCode} className="rounded-lg border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold">Pedido {order.orderCode}</p>
                <p className="text-sm text-muted-foreground">
                  Realizado {new Date(order.purchasedAt).toLocaleString()} · {order.itemsCount}{' '}
                  {order.itemsCount === 1 ? 'relato' : 'relatos'}
                </p>
              </div>
              <p className="text-lg font-bold">
                <Price value={order.totalInCents} currencyCode={order.currencyCode} />
              </p>
            </div>

            <div className="mt-4 space-y-2">
              {order.lines.map((line) => (
                <div key={`${order.orderCode}-${line.storyId}`} className="flex items-center justify-between text-sm">
                  <Link to={`/product/${line.storySlug}`} className="font-medium hover:underline">
                    {line.storyTitle}
                  </Link>
                  <Price value={line.lineTotalInCents} currencyCode={order.currencyCode} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
