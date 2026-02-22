'use client';

import { useMemo, useState } from 'react';
import { ShoppingCart, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { CatalogProduct, ProductVariant } from '@/data/catalog';
import { useCart } from '@/contexts/cart-context';
import { Price } from '@/components/commerce/price';

interface ProductInfoProps {
  product: CatalogProduct;
}

function toPlainText(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function getDefaultVariant(product: CatalogProduct): ProductVariant | null {
  if (!product.variants.length) {
    return null;
  }

  return [...product.variants].sort((a, b) => a.priceWithTax - b.priceWithTax)[0] ?? null;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const synopsis = useMemo(() => toPlainText(product.description), [product.description]);
  const storyBody = useMemo(() => product.body, [product.body]);
  const hasFullBody = useMemo(
    () => Boolean(product.canReadFullBody && storyBody.trim().length > 0),
    [product.canReadFullBody, storyBody],
  );
  const selectedVariant = useMemo(() => getDefaultVariant(product), [product]);

  const handleAddToCart = () => {
    if (!selectedVariant) {
      return;
    }

    addToCart(product, selectedVariant, 1);
    setIsAdded(true);

    toast.success('Relato agregado al carrito', {
      description: `${product.name} fue agregado al carrito`,
    });

    window.setTimeout(() => setIsAdded(false), 2000);
  };

  const isInStock = selectedVariant?.stockLevel !== 'OUT_OF_STOCK';
  const canAddToCart = Boolean(selectedVariant && isInStock);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="space-y-4 text-center pt-6">
        <h1 className="text-3xl font-bold sm:text-4xl">{product.name}</h1>
        <p className="leading-relaxed text-black dark:text-white">{synopsis || 'Sinopsis no disponible.'}</p>
        {selectedVariant && (
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <p>
              <span className="text-foreground font-medium">Tiempo de lectura:</span> {product.readingTimeMinutes} min
            </p>
            <p>
              <span className="text-foreground font-medium">Precio:</span>{' '}
              <Price value={selectedVariant.priceWithTax} />
            </p>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">{hasFullBody ? 'Relato completo' : 'Vista previa'}</h2>
        {hasFullBody ? (
          <p className="leading-relaxed whitespace-pre-wrap text-black dark:text-white">
            {storyBody || 'Cuerpo no disponible.'}
          </p>
        ) : (
          <>
            <p className="leading-relaxed text-black dark:text-white">{synopsis || 'Sinopsis no disponible.'}</p>
            <p className="text-sm text-muted-foreground">
              Compra este relato para desbloquear el texto completo en tu biblioteca.
            </p>
          </>
        )}
      </div>

      {!hasFullBody && (
        <div className="flex justify-center pt-2">
          <Button size="lg" className="min-w-56" disabled={!canAddToCart} onClick={handleAddToCart}>
            {isAdded ? (
              <>
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Agregado al carrito
              </>
            ) : (
              <>
                <ShoppingCart className="mr-2 h-5 w-5" />
                {isInStock ? 'Agregar al carrito' : 'Sin stock'}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
