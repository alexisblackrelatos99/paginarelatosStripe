'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import type { SearchResult } from '@/data/catalog';

interface FacetFiltersProps {
  facetValues: SearchResult['facetValues'];
}

interface FacetGroup {
  id: string;
  name: string;
  values: Array<{
    id: string;
    name: string;
    count: number;
  }>;
}

export function FacetFilters({ facetValues }: FacetFiltersProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const facetGroups = useMemo(() => {
    const groups: Record<string, FacetGroup> = {};

    facetValues.forEach((item) => {
      const facetName = item.facetValue.facet.name;

      if (!groups[facetName]) {
        groups[facetName] = {
          id: item.facetValue.facet.id,
          name: facetName,
          values: [],
        };
      }

      groups[facetName].values.push({
        id: item.facetValue.id,
        name: item.facetValue.name,
        count: item.count,
      });
    });

    return groups;
  }, [facetValues]);

  const selectedFacets = searchParams.getAll('facets');

  const toggleFacet = (facetId: string) => {
    const nextParams = new URLSearchParams(searchParams);
    const currentFacets = nextParams.getAll('facets');

    if (currentFacets.includes(facetId)) {
      nextParams.delete('facets');
      currentFacets.filter((id) => id !== facetId).forEach((id) => nextParams.append('facets', id));
    } else {
      nextParams.append('facets', facetId);
    }

    nextParams.delete('page');
    setSearchParams(nextParams);
  };

  const clearFilters = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('facets');
    nextParams.delete('page');
    setSearchParams(nextParams);
  };

  const hasActiveFilters = selectedFacets.length > 0;

  if (Object.keys(facetGroups).length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">Filtros</h2>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Limpiar todo
          </Button>
        )}
      </div>

      {Object.entries(facetGroups).map(([facetName, facet]) => (
        <div key={facet.id} className="space-y-3">
          <h3 className="font-medium text-sm">{facetName}</h3>
          <div className="space-y-2">
            {facet.values.map((value) => {
              const isChecked = selectedFacets.includes(value.id);

              return (
                <div key={value.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={value.id}
                    checked={isChecked}
                    onCheckedChange={() => toggleFacet(value.id)}
                  />
                  <Label htmlFor={value.id} className="text-sm font-normal cursor-pointer flex items-center gap-2">
                    {value.name}
                    <span className="text-xs text-muted-foreground">({value.count})</span>
                  </Label>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
