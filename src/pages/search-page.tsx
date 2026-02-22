import { useSearchParams } from 'react-router-dom';
import { ProductGrid } from '@/components/commerce/product-grid';
import { searchCatalogProducts } from '@/data/catalog';
import { getCurrentPage, getSearchSort, getSearchTerm } from '@/lib/search-helpers';
import { useCatalogStories } from '@/hooks/use-catalog-stories';
import { useAuth } from '@/contexts/auth-context';

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const { activeCustomer } = useAuth();
  const { products, isLoading, errorCode } = useCatalogStories({
    accessToken: activeCustomer?.accessToken,
  });
  const searchTerm = getSearchTerm(searchParams);
  const currentPage = getCurrentPage(searchParams);
  const sort = getSearchSort(searchParams);

  const result = searchCatalogProducts(products, {
    term: searchTerm,
    sort,
    page: currentPage,
    take: 12,
  });

  return (
    <div className="container mx-auto px-4 pt-4 pb-8 mt-16">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          {searchTerm ? `Resultados para "${searchTerm}"` : 'Buscar'}
        </h1>
      </div>

      {isLoading && <p className="text-muted-foreground mb-4">Cargando relatos...</p>}
      {errorCode && <p className="text-destructive mb-4">No se pudieron cargar relatos ({errorCode}).</p>}

      <ProductGrid
        items={result.items}
        totalItems={result.totalItems}
        currentPage={currentPage}
        totalPages={result.totalPages}
      />
    </div>
  );
}
