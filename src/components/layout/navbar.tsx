import { Suspense } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { NavbarCollections } from '@/components/layout/navbar/navbar-collections';
import { NavbarCart } from '@/components/layout/navbar/navbar-cart';
import { NavbarUser } from '@/components/layout/navbar/navbar-user';
import { ThemeSwitcher } from '@/components/layout/navbar/theme-switcher';
import { SearchInput } from '@/components/layout/search-input';
import { NavbarUserSkeleton } from '@/components/shared/skeletons/navbar-user-skeleton';
import { SearchInputSkeleton } from '@/components/shared/skeletons/search-input-skeleton';

export function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/collection/catalogo" className="flex items-center justify-center gap-2 text-center">
              <BookOpen className="h-6 w-6" aria-label="Book icon" />
              <span className="text-lg font-semibold tracking-tight leading-none">Relatos Alexis</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Suspense>
                <NavbarCollections />
              </Suspense>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex">
              <Suspense fallback={<SearchInputSkeleton />}>
                <SearchInput />
              </Suspense>
            </div>
            <ThemeSwitcher />
            <Suspense>
              <NavbarCart />
            </Suspense>
            <Suspense fallback={<NavbarUserSkeleton />}>
              <NavbarUser />
            </Suspense>
          </div>
        </div>
      </div>
    </header>
  );
}
