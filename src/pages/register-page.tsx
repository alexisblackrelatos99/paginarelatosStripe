import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/auth-context';
import { getAuthErrorMessage } from '@/lib/auth-errors';

export function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register } = useAuth();

  const [form, setForm] = useState({
    username: '',
    emailAddress: '',
    password: '',
    confirmPassword: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo = searchParams.get('redirectTo') ?? '/';
  const signInHref = `/sign-in?redirectTo=${encodeURIComponent(redirectTo)}`;

  const setField = (field: keyof typeof form, value: string) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.username.trim() || !form.emailAddress.trim() || !form.password.trim() || !form.confirmPassword.trim()) {
      setErrorMessage('Completa apodo, correo y contrasenas.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setErrorMessage('Las contrasenas no coinciden.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await register({
        username: form.username,
        emailAddress: form.emailAddress,
        password: form.password,
      });

      const params = new URLSearchParams({
        email: form.emailAddress.trim().toLowerCase(),
      });

      navigate(`/verify-pending?${params.toString()}`);
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
          <h1 className="text-3xl font-bold">Crear cuenta</h1>
          <p className="text-muted-foreground">Registrate para empezar a comprar</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Registro</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="register-username">Apodo</Label>
                <Input
                  id="register-username"
                  value={form.username}
                  onChange={(event) => setField('username', event.target.value)}
                  placeholder="Tu apodo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-email">Correo electronico</Label>
                <Input
                  id="register-email"
                  type="email"
                  value={form.emailAddress}
                  onChange={(event) => setField('emailAddress', event.target.value)}
                  placeholder="tu@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password">Contrasena</Label>
                <Input
                  id="register-password"
                  type="password"
                  value={form.password}
                  onChange={(event) => setField('password', event.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-confirm-password">Confirmar contrasena</Label>
                <Input
                  id="register-confirm-password"
                  type="password"
                  value={form.confirmPassword}
                  onChange={(event) => setField('confirmPassword', event.target.value)}
                  placeholder="••••••••"
                />
              </div>

              {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
              </Button>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 mt-4">
              <div className="text-sm text-center text-muted-foreground">
                Ya tienes cuenta?{' '}
                <Link to={signInHref} className="hover:text-primary underline">
                  Inicia sesion
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
