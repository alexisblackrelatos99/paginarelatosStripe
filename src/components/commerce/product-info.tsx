'use client';

import { useEffect, useMemo, useState } from 'react';
import { ShoppingCart, CheckCircle2, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { CatalogProduct, ProductVariant } from '@/data/catalog';
import { useCart } from '@/contexts/cart-context';

interface ProductInfoProps {
  product: CatalogProduct;
}

const MIN_READER_FONT_SIZE = 16;
const MAX_READER_FONT_SIZE = 28;
const DEFAULT_READER_FONT_SIZE = 18;
const PREVIEW_WORD_LIMIT = 1000;
const READER_FONT_SIZE_STORAGE_KEY = 'reader-font-size';

function toPlainText(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function getPreviewText(text: string, maxWords: number): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) {
    return words.join(' ');
  }

  return `${words.slice(0, maxWords).join(' ')}...`;
}

function getInitialReaderFontSize(): number {
  if (typeof window === 'undefined') {
    return DEFAULT_READER_FONT_SIZE;
  }

  const storedValue = window.localStorage.getItem(READER_FONT_SIZE_STORAGE_KEY);
  const parsedValue = Number.parseInt(storedValue ?? '', 10);
  if (Number.isNaN(parsedValue)) {
    return DEFAULT_READER_FONT_SIZE;
  }

  return Math.min(MAX_READER_FONT_SIZE, Math.max(MIN_READER_FONT_SIZE, parsedValue));
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
  const [readerFontSize, setReaderFontSize] = useState(getInitialReaderFontSize);

  const synopsis = useMemo(() => toPlainText(product.description), [product.description]);
  const storyBody = useMemo(() => product.body, [product.body]);
  const previewBody = useMemo(() => getPreviewText(toPlainText(storyBody), PREVIEW_WORD_LIMIT), [storyBody]);
  const hasFullBody = useMemo(
    () => Boolean(product.canReadFullBody && storyBody.trim().length > 0),
    [product.canReadFullBody, storyBody],
  );
  const selectedVariant = useMemo(() => getDefaultVariant(product), [product]);

  useEffect(() => {
    window.localStorage.setItem(READER_FONT_SIZE_STORAGE_KEY, String(readerFontSize));
  }, [readerFontSize]);

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
          </div>
        )}
      </div>

      <div className="space-y-3">
        {hasFullBody ? (
          <>
            <div className="flex items-center justify-end gap-1 text-muted-foreground">
              <span className="mr-1 text-sm">Tamaño de letra</span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={readerFontSize <= MIN_READER_FONT_SIZE}
                onClick={() =>
                  setReaderFontSize((currentSize) => Math.max(MIN_READER_FONT_SIZE, currentSize - 1))
                }
                aria-label="Reducir tamaño de letra"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={readerFontSize >= MAX_READER_FONT_SIZE}
                onClick={() =>
                  setReaderFontSize((currentSize) => Math.min(MAX_READER_FONT_SIZE, currentSize + 1))
                }
                aria-label="Aumentar tamaño de letra"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p
              className="leading-relaxed whitespace-pre-wrap text-black dark:text-white"
              style={{ fontSize: `${readerFontSize}px` }}
            >
              {storyBody || 'Cuerpo no disponible.'}
            </p>
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold">Vista previa</h2>
            <p className="leading-relaxed text-black dark:text-white">
              {previewBody || synopsis || 'Sinopsis no disponible.'}
            </p>
            <p className="text-sm text-muted-foreground">
              Fragmento de muestra. Compra este relato para desbloquear el texto completo en tu biblioteca.
            </p>
          </>
        )}
      </div>

      {!hasFullBody && (
        <div className="flex flex-col items-center gap-2 pt-2">
          <Button size="lg" className="min-w-56" disabled={!canAddToCart} onClick={handleAddToCart}>
            {isAdded ? (
              <>
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Agregado al carrito
              </>
            ) : (
              <>
                <ShoppingCart className="mr-2 h-5 w-5" />
                {isInStock ? 'Comprar ahora' : 'Sin stock'}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
