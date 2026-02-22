'use client';

import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface CartIconProps {
  cartItemCount: number;
}

export function CartIcon({ cartItemCount }: CartIconProps) {
  return (
    <Button variant="ghost" size="icon" asChild className="relative">
      <Link to="/cart">
        <ShoppingCart className="h-5 w-5" />
        {cartItemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {cartItemCount}
          </span>
        )}
        <span className="sr-only">Carrito</span>
      </Link>
    </Button>
  );
}
