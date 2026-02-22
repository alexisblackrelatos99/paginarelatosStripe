export interface Collection {
  id: string;
  slug: string;
  name: string;
  description: string;
}

export interface ProductAsset {
  id: string;
  preview: string;
  source: string;
}

export interface ProductOption {
  id: string;
  code: string;
  name: string;
  groupId: string;
  group: {
    id: string;
    code: string;
    name: string;
  };
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  priceWithTax: number;
  stockLevel: 'IN_STOCK' | 'OUT_OF_STOCK';
  options: ProductOption[];
}

export interface ProductOptionGroup {
  id: string;
  code: string;
  name: string;
  options: Array<{
    id: string;
    code: string;
    name: string;
  }>;
}

export interface CatalogProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  body: string;
  canReadFullBody: boolean;
  readingTimeMinutes: number;
  createdAt: string;
  assets: ProductAsset[];
  featuredAsset: ProductAsset | null;
  collections: Collection[];
  variants: ProductVariant[];
  optionGroups: ProductOptionGroup[];
  facetValueIds: string[];
}

export interface FacetValue {
  id: string;
  name: string;
  facet: {
    id: string;
    name: string;
  };
}

export interface StoryCatalogSource {
  id: string;
  slug: string;
  title: string;
  synopsis: string;
  body: string;
  fullBodyAvailable: boolean;
  readingTimeMinutes: number;
  priceInCents: number;
  currencyCode: string;
  createdAt: string;
}

interface SearchInput {
  term?: string;
  collectionSlug?: string;
  sort?: string;
  facetValueIds?: string[];
  take?: number;
  page?: number;
}

export interface SearchResult {
  items: CatalogProduct[];
  totalItems: number;
  facetValues: Array<{
    facetValue: FacetValue;
    count: number;
  }>;
  totalPages: number;
}

const collections: Collection[] = [
  {
    id: 'col-catalogo',
    slug: 'catalogo',
    name: 'Catalogo',
    description: 'Catalogo de relatos publicados y disponibles para descubrir.',
  },
  {
    id: 'col-biblioteca',
    slug: 'biblioteca',
    name: 'Biblioteca',
    description: 'Biblioteca de relatos comprados, lista para leer cuando quieras.',
  },
];

function defaultCollection(): Collection {
  return collections[0];
}

function getPrice(product: CatalogProduct): number {
  if (product.variants.length === 0) {
    return 0;
  }
  return Math.min(...product.variants.map((variant) => variant.priceWithTax));
}

function sortItems(items: CatalogProduct[], sort: string) {
  const sorted = [...items];

  switch (sort) {
    case 'reading-desc':
      sorted.sort((a, b) => {
        const readingTimeDiff = b.readingTimeMinutes - a.readingTimeMinutes;
        if (readingTimeDiff !== 0) {
          return readingTimeDiff;
        }
        return a.name.localeCompare(b.name);
      });
      return sorted;
    case 'recent-desc':
      sorted.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
      return sorted;
    case 'name-desc':
      sorted.sort((a, b) => b.name.localeCompare(a.name));
      return sorted;
    case 'price-asc':
      sorted.sort((a, b) => getPrice(a) - getPrice(b));
      return sorted;
    case 'price-desc':
      sorted.sort((a, b) => getPrice(b) - getPrice(a));
      return sorted;
    case 'name-asc':
    default:
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      return sorted;
  }
}

export function storyToCatalogProduct(story: StoryCatalogSource): CatalogProduct {
  const canonicalCollection = defaultCollection();

  return {
    id: story.id,
    slug: story.slug,
    name: story.title,
    description: story.synopsis,
    body: story.body,
    canReadFullBody: story.fullBodyAvailable,
    readingTimeMinutes: story.readingTimeMinutes,
    createdAt: story.createdAt,
    assets: [],
    featuredAsset: null,
    collections: [canonicalCollection],
    optionGroups: [],
    variants: [
      {
        id: `var-${story.id}`,
        name: story.title,
        sku: `REL-${story.id}`,
        priceWithTax: story.priceInCents,
        stockLevel: 'IN_STOCK',
        options: [],
      },
    ],
    facetValueIds: [],
  };
}

export function getTopCollections() {
  return collections;
}

export function getCollectionBySlug(slug: string) {
  return collections.find((collection) => collection.slug === slug) ?? null;
}

export function getFeaturedProducts(items: CatalogProduct[], take = 12) {
  return sortItems(items, 'recent-desc').slice(0, take);
}

export function getProductBySlug(items: CatalogProduct[], slug: string) {
  return items.find((product) => product.slug === slug) ?? null;
}

export function getRelatedProducts(items: CatalogProduct[], currentProductId: string, take = 12) {
  return sortItems(
    items.filter((product) => product.id !== currentProductId),
    'recent-desc',
  ).slice(0, take);
}

export function searchCatalogProducts(items: CatalogProduct[], input: SearchInput): SearchResult {
  const {
    term,
    collectionSlug,
    sort = 'name-asc',
    facetValueIds = [],
    take = 12,
    page = 1,
  } = input;

  const normalizedTerm = term?.trim().toLowerCase() ?? '';

  const scopedItems = items.filter((product) => {
    const matchesCollection = collectionSlug
      ? product.collections.some((collection) => collection.slug === collectionSlug)
      : true;

    const matchesTerm = normalizedTerm
      ? product.name.toLowerCase().includes(normalizedTerm) ||
        product.description.toLowerCase().includes(normalizedTerm) ||
        product.body.toLowerCase().includes(normalizedTerm)
      : true;

    return matchesCollection && matchesTerm;
  });

  const filteredItems = facetValueIds.length
    ? scopedItems.filter((product) =>
        facetValueIds.every((facetValueId) => product.facetValueIds.includes(facetValueId)),
      )
    : scopedItems;

  const sortedItems = sortItems(filteredItems, sort);
  const totalItems = sortedItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / take));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const startIndex = (safePage - 1) * take;
  const endIndex = startIndex + take;

  return {
    items: sortedItems.slice(startIndex, endIndex),
    totalItems,
    facetValues: [],
    totalPages,
  };
}

export function getReadingTimeMinutesFromText(text: string): number {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
