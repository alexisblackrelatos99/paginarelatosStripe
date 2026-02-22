import { User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LoginButton } from '@/components/layout/navbar/login-button';
import { useAuth } from '@/contexts/auth-context';

export function NavbarUser() {
  const { activeCustomer } = useAuth();

  if (!activeCustomer) {
    return (
      <Button variant="ghost" asChild>
        <LoginButton isLoggedIn={false} />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost">
          <User className="h-5 w-5" />
          Hola, {activeCustomer.username}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem asChild>
          <Link to="/account/profile">Perfil</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/account/orders">Pedidos</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <LoginButton isLoggedIn />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
