'use client';

import { useEffect, useState, useTransition } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function SearchInput() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(searchParams.get('q') ?? '');

  useEffect(() => {
    setSearchValue(searchParams.get('q') ?? '');
  }, [searchParams]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!searchValue.trim()) {
      return;
    }

    startTransition(() => {
      navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Buscar en catálogo..."
        className="pl-9 w-64"
        value={searchValue}
        onChange={(event) => setSearchValue(event.target.value)}
        disabled={isPending}
      />
    </form>
  );
}
