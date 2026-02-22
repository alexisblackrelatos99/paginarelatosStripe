import { Link } from 'react-router-dom';
import { BadgePercent, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Price } from '@/components/commerce/price';
import { useCart } from '@/contexts/cart-context';

export function CartPage() {
  const { activeOrder, removeFromCart } = useCart();

  if (activeOrder.lines.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Tu carrito esta vacio</h1>
          <p className="text-muted-foreground mb-8">Agrega relatos a tu carrito para comenzar</p>
          <Button asChild>
            <Link to="/">Seguir comprando</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-20">
      <h1 className="text-3xl font-bold mb-8">Carrito</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {activeOrder.lines.map((line) => (
            <div key={line.id} className="relative rounded-lg border bg-card p-4">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => removeFromCart(line.id)}
                aria-label={`Eliminar ${line.productVariant.product.name} del carrito`}
              >
                <X className="h-5 w-5" />
              </Button>

              <div className="flex flex-col gap-4 pr-10 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-1">
                  <Link
                    to={`/product/${line.productVariant.product.slug}`}
                    className="block font-semibold hover:underline"
                  >
                    {line.productVariant.product.name}
                  </Link>
                  {line.productVariant.name !== line.productVariant.product.name && (
                    <p className="text-sm text-muted-foreground">{line.productVariant.name}</p>
                  )}
                </div>

                <p className="text-lg font-semibold sm:flex-shrink-0 sm:text-right">
                  <Price value={line.linePriceWithTax} currencyCode={activeOrder.currencyCode} />
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="border rounded-lg p-6 bg-card sticky top-20">
            <h2 className="text-xl font-bold mb-4">Resumen del pedido</h2>

            <div className="space-y-2 mb-4">
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

            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>
                  <Price value={activeOrder.totalWithTax} currencyCode={activeOrder.currencyCode} />
                </span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Compra mínima: 1,5$</p>
            </div>

            <Button className="w-full" size="lg" asChild>
              <Link to="/checkout">Ir al pago</Link>
            </Button>

            <Button variant="outline" className="w-full mt-2" asChild>
              <Link to="/">Seguir comprando</Link>
            </Button>
          </div>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BadgePercent className="h-5 w-5" />
                Promociones automaticas
              </CardTitle>
              <CardDescription>Aplicamos descuentos automaticamente segun el importe del pedido.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>Hay descuento en pedidos superiores a $5 USD, y un descuento mayor al superar $10 USD.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
