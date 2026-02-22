import { CartIcon } from './cart-icon';
import { useCart } from '@/contexts/cart-context';

export function NavbarCart() {
  const { cartItemCount } = useCart();

  return <CartIcon cartItemCount={cartItemCount} />;
}
