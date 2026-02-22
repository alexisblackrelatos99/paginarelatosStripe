import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Pagination } from '@/components/shared/pagination';
import { SortDropdown } from './sort-dropdown';
import { Price } from '@/components/commerce/price';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/cart-context';
import { toast } from 'sonner';
import type { CatalogProduct, ProductVariant } from '@/data/catalog';

interface ProductGridProps {
  items: CatalogProduct[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
  showAddToCart?: boolean;
  showPrice?: boolean;
}

function getSynopsis(description: string): string {
  const plainText = description.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return plainText || 'Sinopsis no disponible.';
}

function getReadingTimeMinutes(text: string): number {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function getDefaultVariant(product: CatalogProduct): ProductVariant | null {
  if (!product.variants.length) {
    return null;
  }

  return [...product.variants].sort((a, b) => a.priceWithTax - b.priceWithTax)[0] ?? null;
}

export function ProductGrid({
  items,
  totalItems,
  currentPage,
  totalPages,
  showAddToCart = false,
  showPrice = true,
}: ProductGridProps) {
  const { addToCart } = useCart();

  const handleAddToCart = (product: CatalogProduct) => {
    const variant = getDefaultVariant(product);

    if (!variant) {
      return;
    }

    addToCart(product, variant, 1);
    toast.success('Relato agregado al carrito');
  };

  if (!items.length) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No se encontraron relatos</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {totalItems} {totalItems === 1 ? 'relato' : 'relatos'}
        </p>
        <SortDropdown />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {items.map((product) => {
          const prices = product.variants.map((variant) => variant.priceWithTax);
          const minPrice = Math.min(...prices);
          const maxPrice = Math.max(...prices);
          const hasPriceRange = minPrice !== maxPrice;
          const synopsis = getSynopsis(product.description);
          const readingTimeMinutes =
            product.readingTimeMinutes > 0 ? product.readingTimeMinutes : getReadingTimeMinutes(product.body);

          return (
            <article
              key={product.id}
              className="rounded-lg border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/40"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <Link to={`/product/${product.slug}`} className="group block min-w-0 flex-1">
                  <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  <p className="mt-3 text-muted-foreground leading-relaxed">{synopsis}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                    <p>
                      <span className="text-foreground font-medium">Tiempo de lectura:</span>{' '}
                      {readingTimeMinutes} min
                    </p>
                    {showPrice && (
                      <p>
                        <span className="text-foreground font-medium">Precio:</span>{' '}
                        {hasPriceRange ? (
                          <>
                            Desde <Price value={minPrice} /> hasta <Price value={maxPrice} />
                          </>
                        ) : (
                          <Price value={minPrice} />
                        )}
                      </p>
                    )}
                  </div>
                </Link>
                {showAddToCart && (
                  <Button
                    type="button"
                    onClick={() => handleAddToCart(product)}
                    className="inline-flex w-full items-center justify-center gap-2 md:w-auto md:shrink-0"
                    aria-label={`Agregar ${product.name} al carrito`}
                  >
                    <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                    Agregar al carrito
                  </Button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} />}
    </div>
  );
}
