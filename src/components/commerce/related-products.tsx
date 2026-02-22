import { Link } from 'react-router-dom';
import { Price } from '@/components/commerce/price';
import type { CatalogProduct } from '@/data/catalog';

interface RelatedProductsProps {
  products: CatalogProduct[];
}

function toPlainText(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function getSynopsis(description: string): string {
  const plainText = toPlainText(description);

  if (!plainText) {
    return 'Sinopsis no disponible.';
  }

  const words = plainText.split(/\s+/).filter(Boolean);

  if (words.length <= 28) {
    return plainText;
  }

  return `${words.slice(0, 28).join(' ')}...`;
}

function getPriceRange(product: CatalogProduct) {
  const prices = product.variants.map((variant) => variant.priceWithTax);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  return {
    minPrice,
    hasPriceRange: minPrice !== maxPrice,
  };
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-10 md:py-12">
      <div className="container mx-auto px-4">
        <h2 className="mb-5 text-center text-xl font-semibold sm:text-2xl">Relatos relacionados</h2>
        <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-3 md:gap-4">
          {products.map((product) => {
            const synopsis = getSynopsis(product.description);
            const readingTimeMinutes = product.readingTimeMinutes;
            const { minPrice, hasPriceRange } = getPriceRange(product);

            return (
              <article
                key={product.id}
                className="w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-0.75rem)] xl:w-[calc(25%-0.75rem)]"
              >
                <Link
                  to={`/product/${product.slug}`}
                  className="group block h-full rounded-lg border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
                >
                  <h3 className="line-clamp-2 text-lg font-semibold leading-tight transition-colors group-hover:text-primary">
                    {product.name}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{synopsis}</p>
                  <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-center text-xs text-muted-foreground">
                    <p>
                      <span className="font-medium text-foreground">Lectura:</span> {readingTimeMinutes} min
                    </p>
                    <p>
                      <span className="font-medium text-foreground">Precio:</span>{' '}
                      {hasPriceRange ? (
                        <>
                          Desde <Price value={minPrice} />
                        </>
                      ) : (
                        <Price value={minPrice} />
                      )}
                    </p>
                  </div>
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
