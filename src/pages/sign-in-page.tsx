import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/auth-context';
import { getAuthErrorMessage } from '@/lib/auth-errors';

export function SignInPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn } = useAuth();
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo = searchParams.get('redirectTo') ?? '/';
  const registerHref = `/register?redirectTo=${encodeURIComponent(redirectTo)}`;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!identity.trim() || !password.trim()) {
      setErrorMessage('Completa correo o apodo y contrasena.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await signIn({
        usernameOrEmail: identity,
        password,
      });

      navigate(redirectTo);
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100dvh-10rem)] items-center justify-center px-4 py-4">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Iniciar sesion</h1>
          <p className="text-muted-foreground">Ingresa tus credenciales para acceder a tu cuenta</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bienvenido de nuevo</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sign-in-identity">Correo o apodo</Label>
                <Input
                  id="sign-in-identity"
                  type="text"
                  value={identity}
                  onChange={(event) => setIdentity(event.target.value)}
                  placeholder="tu@email.com o tu_apodo"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="sign-in-password">Contrasena</Label>
                  <Link to="/forgot-password" className="text-muted-foreground hover:text-primary text-sm">
                    Olvidaste tu contrasena?
                  </Link>
                </div>
                <Input
                  id="sign-in-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                />
              </div>

              {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Iniciando sesion...' : 'Iniciar sesion'}
              </Button>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 mt-2">
              <div className="text-muted-foreground text-sm text-center">
                No tienes cuenta?{' '}
                <Link to={registerHref} className="hover:text-primary underline">
                  Registrate
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
