'use client';

import { ComponentProps, useTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';

interface LoginButtonProps extends ComponentProps<'button'> {
  isLoggedIn: boolean;
}

export function LoginButton({ isLoggedIn, ...props }: LoginButtonProps) {
  const [isPending, startTransition] = useTransition();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  return (
    <button
      {...props}
      aria-disabled={isPending}
      onClick={() => {
        if (isLoggedIn) {
          startTransition(() => {
            signOut();
            navigate('/');
          });
          return;
        }

        navigate('/sign-in');
      }}
    >
      {isLoggedIn ? 'Cerrar sesion' : 'Iniciar sesion'}
    </button>
  );
}
