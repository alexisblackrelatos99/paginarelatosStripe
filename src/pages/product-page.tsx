import { Navigate, useParams } from 'react-router-dom';
import { ProductInfo } from '@/components/commerce/product-info';
import { RelatedProducts } from '@/components/commerce/related-products';
import { getProductBySlug, getRelatedProducts } from '@/data/catalog';
import { useCatalogStories } from '@/hooks/use-catalog-stories';
import { useAuth } from '@/contexts/auth-context';

export function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const { activeCustomer } = useAuth();
  const { products, isLoading } = useCatalogStories({
    accessToken: activeCustomer?.accessToken,
  });

  if (!slug) {
    return <Navigate to="/not-found" replace />;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 pt-8 pb-12">
        <p className="text-muted-foreground">Cargando relato...</p>
      </div>
    );
  }

  const product = getProductBySlug(products, slug);

  if (!product) {
    return <Navigate to="/not-found" replace />;
  }

  const relatedProducts = getRelatedProducts(products, product.id);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      <div className="container mx-auto px-4 pt-2 pb-8">
        <ProductInfo product={product} />
      </div>

      {relatedProducts.length > 0 && (
        <div className="mt-auto pt-14 md:pt-20">
          <RelatedProducts products={relatedProducts} />
        </div>
      )}
    </div>
  );
}
