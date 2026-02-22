import { ProductCarousel } from '@/components/commerce/product-carousel';
import { getFeaturedProducts } from '@/data/catalog';
import { useCatalogStories } from '@/hooks/use-catalog-stories';
import { useAuth } from '@/contexts/auth-context';

export function FeaturedProducts() {
  const { activeCustomer } = useAuth();
  const { products: catalogProducts } = useCatalogStories({
    accessToken: activeCustomer?.accessToken,
  });
  const products = getFeaturedProducts(catalogProducts);

  if (products.length === 0) {
    return null;
  }

  return <ProductCarousel title="Relatos destacados" products={products} />;
}
