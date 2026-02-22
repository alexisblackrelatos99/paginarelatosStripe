import { Link, NavLink, Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import { isAlexisCustomer } from '@/lib/auth-helpers';

export function AccountLayoutPage() {
  const { activeCustomer } = useAuth();

  if (!activeCustomer) {
    return (
      <div className="container mx-auto px-4 py-20">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Inicio de sesion requerido</CardTitle>
            <CardDescription>Debes iniciar sesion para acceder a tu cuenta.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/sign-in?redirectTo=/account/profile">Ir a iniciar sesion</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const links = [
    { to: '/account/profile', label: 'Perfil' },
    { to: '/account/orders', label: 'Pedidos' },
    ...(isAlexisCustomer(activeCustomer)
      ? [{ to: '/account/create-story', label: 'Publicar relato' }]
      : []),
  ];

  return (
    <div className="container mx-auto px-4 pt-4 pb-8 mt-16">
      <h1 className="text-3xl font-bold mb-8">Mi cuenta</h1>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <nav className="space-y-2">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    'block rounded-md border px-4 py-3 text-sm transition-colors hover:bg-muted',
                    isActive && 'bg-primary text-primary-foreground border-primary',
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <div className="lg:col-span-3">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
