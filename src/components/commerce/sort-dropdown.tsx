'use client';

import { useSearchParams } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const sortOptions = [
  { value: 'recent-desc', label: 'Mas recientes' },
  { value: 'name-asc', label: 'Titulo (A-Z)' },
  { value: 'name-desc', label: 'Titulo (Z-A)' },
  { value: 'reading-desc', label: 'Lectura mas larga' },
];

export function SortDropdown() {
  const [searchParams, setSearchParams] = useSearchParams();
  const sortValues = new Set(sortOptions.map((option) => option.value));
  const sortParam = searchParams.get('sort') ?? 'name-asc';
  const currentSort = sortValues.has(sortParam) ? sortParam : 'name-asc';

  const handleSortChange = (value: string) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('sort', value);
    nextParams.delete('page');
    setSearchParams(nextParams);
  };

  return (
    <Select value={currentSort} onValueChange={handleSortChange}>
      <SelectTrigger className="w-[260px]">
        <SelectValue placeholder="Ordenar por" />
      </SelectTrigger>
      <SelectContent>
        {sortOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
