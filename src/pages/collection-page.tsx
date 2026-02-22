import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { ProductGrid } from '@/components/commerce/product-grid';
import { getCollectionBySlug, searchCatalogProducts } from '@/data/catalog';
import { getCurrentPage, getSearchSort } from '@/lib/search-helpers';
import { useAuth } from '@/contexts/auth-context';
import { useCatalogStories } from '@/hooks/use-catalog-stories';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function collectionErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'HTTP_401':
    case 'HTTP_403':
      return 'Tu sesion expiro. Inicia sesion otra vez para ver tu biblioteca.';
    default:
      return 'Intenta recargar la pagina en unos segundos.';
  }
}

export function CollectionPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const { activeCustomer } = useAuth();
  const isLibrarySlug = slug === 'biblioteca';
  const { products, isLoading, errorCode } = useCatalogStories({
    scope: isLibrarySlug ? 'library' : 'catalog',
    accessToken: activeCustomer?.accessToken,
  });

  if (!slug) {
    return <Navigate to="/not-found" replace />;
  }

  const collection = getCollectionBySlug(slug);

  if (!collection) {
    return <Navigate to="/not-found" replace />;
  }

  const currentPage = getCurrentPage(searchParams);
  const sort = getSearchSort(searchParams);
  const isLibraryCollection = collection.slug === 'biblioteca';
  const isCatalogCollection = collection.slug === 'catalogo';
  const hasCenteredLayout = isLibraryCollection || isCatalogCollection;
  const containerClassName = hasCenteredLayout
    ? 'mx-auto w-full max-w-5xl px-4 pt-2 pb-8 md:px-8 xl:px-10'
    : 'container mx-auto px-4 pt-2 pb-8';

  if (isLibraryCollection && !activeCustomer) {
    return (
      <div className={containerClassName}>
        <div className="mb-6 space-y-2 pt-6">
          <h1 className="text-3xl font-bold">{collection.name}</h1>
          <p className="text-muted-foreground">{collection.description}</p>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Biblioteca privada</CardTitle>
            <CardDescription>
              Inicia sesion o registrate para ver la lista de tus relatos comprados.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link to="/sign-in?redirectTo=/collection/biblioteca">Iniciar sesion</Link>
            </Button>
            <Button asChild>
              <Link to="/register?redirectTo=/collection/biblioteca">Registrate</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={containerClassName}>
        <div className="mb-6 space-y-2 pt-6">
          <h1 className="text-3xl font-bold">{collection.name}</h1>
          <p className="text-muted-foreground">{collection.description}</p>
        </div>
        <p className="text-muted-foreground">Cargando relatos...</p>
      </div>
    );
  }

  if (errorCode) {
    return (
      <div className={containerClassName}>
        <div className="mb-6 space-y-2 pt-6">
          <h1 className="text-3xl font-bold">{collection.name}</h1>
          <p className="text-muted-foreground">{collection.description}</p>
        </div>
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>No se pudieron cargar los relatos</CardTitle>
            <CardDescription>{collectionErrorMessage(errorCode)}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const sourceItems = isCatalogCollection || isLibraryCollection ? products : [];

  const result = searchCatalogProducts(sourceItems, {
    collectionSlug: isCatalogCollection ? slug : undefined,
    sort,
    page: currentPage,
    take: 12,
  });

  return (
    <div className={containerClassName}>
      <div className="mb-6 space-y-2 pt-6">
        <h1 className="text-3xl font-bold">{collection.name}</h1>
        <p className="text-muted-foreground">{collection.description}</p>
      </div>

      <ProductGrid
        items={result.items}
        totalItems={result.totalItems}
        currentPage={currentPage}
        totalPages={result.totalPages}
        showAddToCart={isCatalogCollection}
        showPrice={!isLibraryCollection}
      />
    </div>
  );
}
