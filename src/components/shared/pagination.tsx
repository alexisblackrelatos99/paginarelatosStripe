'use client';

import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const location = useLocation();

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(location.search);
    params.set('page', page.toString());
    return `${location.pathname}?${params.toString()}`;
  };

  const getPageNumbers = () => {
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: Array<number | '...'> = [];

    for (let index = 1; index <= totalPages; index += 1) {
      if (
        index === 1 ||
        index === totalPages ||
        (index >= currentPage - delta && index <= currentPage + delta)
      ) {
        range.push(index);
      }
    }

    let previous = 0;

    for (const page of range) {
      if (previous && page - previous > 1) {
        rangeWithDots.push('...');
      }
      rangeWithDots.push(page);
      previous = page;
    }

    return rangeWithDots;
  };

  const pages = getPageNumbers();

  return (
    <nav className="flex items-center justify-center gap-2">
      <Button variant="outline" size="icon" asChild disabled={currentPage === 1}>
        {currentPage === 1 ? (
          <span className="cursor-not-allowed">
            <ChevronLeft className="h-4 w-4" />
          </span>
        ) : (
          <Link to={createPageUrl(currentPage - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Link>
        )}
      </Button>

      {pages.map((page, index) => {
        if (page === '...') {
          return (
            <span key={`dots-${index}`} className="px-2 text-muted-foreground">
              ...
            </span>
          );
        }

        const isActive = page === currentPage;

        return (
          <Button key={page} variant={isActive ? 'default' : 'outline'} size="icon" asChild={!isActive} disabled={isActive}>
            {isActive ? <span>{page}</span> : <Link to={createPageUrl(page)}>{page}</Link>}
          </Button>
        );
      })}

      <Button variant="outline" size="icon" asChild disabled={currentPage === totalPages}>
        {currentPage === totalPages ? (
          <span className="cursor-not-allowed">
            <ChevronRight className="h-4 w-4" />
          </span>
        ) : (
          <Link to={createPageUrl(currentPage + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </Button>
    </nav>
  );
}
