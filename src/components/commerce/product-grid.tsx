import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { Pagination } from '@/components/shared/pagination';
import { SortDropdown } from './sort-dropdown';
import { Price } from '@/components/commerce/price';
import { Button } from '@/components/ui/button';
import type { CatalogProduct } from '@/data/catalog';

interface ProductGridProps {
  items: CatalogProduct[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
  showReadButton?: boolean;
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

export function ProductGrid({
  items,
  totalItems,
  currentPage,
  totalPages,
  showReadButton = false,
  showPrice = true,
}: ProductGridProps) {
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
                {showReadButton && (
                  <Button asChild className="inline-flex w-full items-center justify-center gap-2 md:w-auto md:shrink-0">
                    <Link to={`/product/${product.slug}`} aria-label={`Leer ${product.name}`}>
                      <BookOpen className="h-4 w-4" aria-hidden="true" />
                      Leer
                    </Link>
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
