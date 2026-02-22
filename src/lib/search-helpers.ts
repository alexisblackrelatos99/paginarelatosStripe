const allowedSorts = new Set(['reading-desc', 'recent-desc', 'name-asc', 'name-desc']);

export function getCurrentPage(params: URLSearchParams): number {
  const page = Number(params.get('page') ?? '1');
  if (Number.isNaN(page) || page < 1) {
    return 1;
  }
  return page;
}

export function getFacetFilters(params: URLSearchParams): string[] {
  return params.getAll('facets').filter(Boolean);
}

export function getSearchSort(params: URLSearchParams): string {
  const sort = params.get('sort') ?? 'name-asc';
  return allowedSorts.has(sort) ? sort : 'name-asc';
}

export function getSearchTerm(params: URLSearchParams): string {
  return params.get('q')?.trim() ?? '';
}
