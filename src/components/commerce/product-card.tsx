import { Link } from 'react-router-dom';
import { Price } from '@/components/commerce/price';
import type { CatalogProduct } from '@/data/catalog';

interface ProductCardProps {
  product: CatalogProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const prices = product.variants.map((variant) => variant.priceWithTax);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const hasPriceRange = minPrice !== maxPrice;

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group block bg-card rounded-lg overflow-hidden border border-border hover:shadow-lg transition-shadow"
    >
      <div className="aspect-square relative bg-muted overflow-hidden">
        {product.featuredAsset ? (
          <img
            src={product.featuredAsset.preview}
            alt={product.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            Sin imagen
          </div>
        )}
      </div>
      <div className="p-4 space-y-2">
        <h3 className="font-medium line-clamp-2 group-hover:text-primary transition-colors">{product.name}</h3>
        <p className="text-lg font-bold">
          {hasPriceRange ? (
            <>
              desde <Price value={minPrice} />
            </>
          ) : (
            <Price value={minPrice} />
          )}
        </p>
      </div>
    </Link>
  );
}
