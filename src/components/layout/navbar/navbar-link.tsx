'use client';

import { ComponentProps } from 'react';
import { NavLink } from 'react-router-dom';
import {
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';

interface NavbarLinkProps extends Omit<ComponentProps<typeof NavLink>, 'className'> {
  className?: string;
}

export function NavbarLink({ to, className, children, ...rest }: NavbarLinkProps) {
  return (
    <NavigationMenuLink asChild>
      <NavLink
        to={to}
        className={({ isActive }) => cn(navigationMenuTriggerStyle(), isActive && 'bg-accent', className)}
        {...rest}
      >
        {children}
      </NavLink>
    </NavigationMenuLink>
  );
}
