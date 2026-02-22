import { Suspense, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Library, LogIn, Menu, Palette, ShoppingCart, UserPlus } from 'lucide-react';
import { NavbarCollections } from '@/components/layout/navbar/navbar-collections';
import { NavbarCart } from '@/components/layout/navbar/navbar-cart';
import { NavbarUser } from '@/components/layout/navbar/navbar-user';
import { ThemeSwitcher } from '@/components/layout/navbar/theme-switcher';
import { SearchInput } from '@/components/layout/search-input';
import { Button } from '@/components/ui/button';
import { navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { NavbarUserSkeleton } from '@/components/shared/skeletons/navbar-user-skeleton';
import { SearchInputSkeleton } from '@/components/shared/skeletons/search-input-skeleton';
import { cn } from '@/lib/utils';

function MobileNavbarMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuItemClassName = cn(navigationMenuTriggerStyle(), 'h-10 w-full justify-start gap-2 px-3');

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Abrir menu principal">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[82vw] p-0 shadow-none sm:max-w-sm">
        <SheetHeader className="sr-only">
          <SheetTitle>Navegacion principal</SheetTitle>
          <SheetDescription className="sr-only">Navegacion principal</SheetDescription>
        </SheetHeader>

        <nav className="mt-12 flex flex-col gap-1 px-1 pb-1">
          <SheetClose asChild>
            <Link to="/collection/catalogo" className={menuItemClassName}>
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              Catálogo
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link to="/collection/biblioteca" className={menuItemClassName}>
              <Library className="h-4 w-4" aria-hidden="true" />
              Biblioteca
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link to="/cart" className={menuItemClassName}>
              <ShoppingCart className="h-4 w-4" aria-hidden="true" />
              Carrito
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link to="/sign-in" className={menuItemClassName}>
              <LogIn className="h-4 w-4" aria-hidden="true" />
              Iniciar sesión
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link to="/register" className={menuItemClassName}>
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              Crear cuenta
            </Link>
          </SheetClose>
          <div className={cn(menuItemClassName, 'justify-between')}>
            <span className="inline-flex items-center gap-2">
              <Palette className="h-4 w-4" aria-hidden="true" />
              Tema
            </span>
            <ThemeSwitcher />
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}

export function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/collection/catalogo" className="flex items-center justify-center gap-2 text-center">
              <BookOpen className="h-5 w-5 md:h-6 md:w-6" aria-hidden="true" />
              <span className="text-lg font-semibold tracking-tight leading-none">Relatos Alexis</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Suspense>
                <NavbarCollections />
              </Suspense>
            </nav>
          </div>
          <div className="hidden md:flex items-center gap-4">
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
          <MobileNavbarMenu />
        </div>
      </div>
    </header>
  );
}
