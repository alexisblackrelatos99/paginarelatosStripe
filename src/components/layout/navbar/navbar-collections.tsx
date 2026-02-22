import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import { NavbarLink } from '@/components/layout/navbar/navbar-link';
import { getTopCollections } from '@/data/catalog';

export function NavbarCollections() {
  const collections = getTopCollections();

  return (
    <NavigationMenu>
      <NavigationMenuList>
        {collections.map((collection) => (
          <NavigationMenuItem key={collection.id}>
            <NavbarLink to={`/collection/${collection.slug}`}>{collection.name}</NavbarLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
