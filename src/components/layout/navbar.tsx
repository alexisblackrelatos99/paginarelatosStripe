import { Suspense, useState, useTransition } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Menu, ShoppingCart } from 'lucide-react';
import { NavbarCollections } from '@/components/layout/navbar/navbar-collections';
import { NavbarCart } from '@/components/layout/navbar/navbar-cart';
import { NavbarUser } from '@/components/layout/navbar/navbar-user';
import { ThemeSwitcher } from '@/components/layout/navbar/theme-switcher';
import { SearchInput } from '@/components/layout/search-input';
import { Button } from '@/components/ui/button';
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
import { useAuth } from '@/contexts/auth-context';
import { useCart } from '@/contexts/cart-context';
import { getTopCollections } from '@/data/catalog';

function MobileNavbarMenu() {
  const navigate = useNavigate();
  const { activeCustomer, signOut } = useAuth();
  const { cartItemCount } = useCart();
  const [isSigningOut, startSignOutTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const collections = getTopCollections();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Abrir menu principal">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[82vw] p-0 sm:max-w-sm">
        <SheetHeader className="border-b px-6 py-5">
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>Navega por RelatosAlexis desde aqui.</SheetDescription>
        </SheetHeader>

        <div className="space-y-5 px-6 py-5">
          <nav className="space-y-2">
            {collections.map((collection) => (
              <SheetClose asChild key={collection.id}>
                <Link
                  to={`/collection/${collection.slug}`}
                  className="block rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent"
                >
                  {collection.name}
                </Link>
              </SheetClose>
            ))}
          </nav>

          <div className="space-y-2 border-t pt-5">
            <SheetClose asChild>
              <Link
                to="/cart"
                className="flex items-center justify-between rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent"
              >
                <span className="inline-flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Carrito
                </span>
                {cartItemCount > 0 ? (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                    {cartItemCount}
                  </span>
                ) : null}
              </Link>
            </SheetClose>
          </div>

          <div className="space-y-2 border-t pt-5">
            {activeCustomer ? (
              <>
                <SheetClose asChild>
                  <Link
                    to="/account/profile"
                    className="block rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent"
                  >
                    Perfil
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    to="/account/orders"
                    className="block rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent"
                  >
                    Pedidos
                  </Link>
                </SheetClose>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start"
                  disabled={isSigningOut}
                  onClick={() => {
                    startSignOutTransition(() => {
                      signOut();
                      setIsOpen(false);
                      navigate('/');
                    });
                  }}
                >
                  {isSigningOut ? 'Cerrando sesion...' : 'Cerrar sesion'}
                </Button>
              </>
            ) : (
              <>
                <SheetClose asChild>
                  <Link
                    to="/sign-in"
                    className="block rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent"
                  >
                    Iniciar sesion
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    to="/register"
                    className="block rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent"
                  >
                    Crear cuenta
                  </Link>
                </SheetClose>
              </>
            )}
          </div>

          <div className="border-t pt-5">
            <ThemeSwitcher />
          </div>
        </div>
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
              <BookOpen className="hidden h-6 w-6 md:block" aria-label="Book icon" />
              <span className="text-lg font-semibold tracking-tight leading-none">RelatosAlexis</span>
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
