import { useCallback, useEffect, useMemo, useState } from 'react';
import { storiesApi } from '../../api/stories-api';
import { storyToCatalogProduct, type CatalogProduct } from '@/data/catalog';
import { ApiError } from '../../api/http-client';

interface UseCatalogStoriesResult {
  products: CatalogProduct[];
  isLoading: boolean;
  errorCode: string | null;
  refetch: () => Promise<void>;
}

type StoriesScope = 'catalog' | 'library';

interface UseCatalogStoriesOptions {
  scope?: StoriesScope;
  accessToken?: string | null;
}

function codeFromError(error: unknown): string {
  if (error instanceof ApiError) {
    return error.code;
  }
  return 'UNKNOWN_ERROR';
}

export function useCatalogStories(options: UseCatalogStoriesOptions = {}): UseCatalogStoriesResult {
  const scope = options.scope ?? 'catalog';
  const accessToken = options.accessToken?.trim() || null;

  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const fetchStories = useCallback(async () => {
    if (scope === 'library' && !accessToken) {
      setProducts([]);
      setErrorCode(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorCode(null);

    try {
      const stories =
        scope === 'library' && accessToken
          ? await storiesApi.listLibraryStories(accessToken)
          : await storiesApi.listStories(accessToken);
      setProducts(stories.map(storyToCatalogProduct));
    } catch (error) {
      setProducts([]);
      setErrorCode(codeFromError(error));
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, scope]);

  useEffect(() => {
    void fetchStories();
  }, [fetchStories]);

  return useMemo(
    () => ({
      products,
      isLoading,
      errorCode,
      refetch: fetchStories,
    }),
    [products, isLoading, errorCode, fetchStories],
  );
}
