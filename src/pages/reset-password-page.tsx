import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/auth-context';
import { getAuthErrorMessage } from '@/lib/auth-errors';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const { resetPassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tokenFromQuery = searchParams.get('token')?.trim() ?? '';
  const token = tokenFromQuery;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!token) {
      setErrorMessage('Falta el token de restablecimiento.');
      return;
    }

    if (!password || password !== confirmPassword) {
      setErrorMessage('Las contrasenas no coinciden.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await resetPassword(token, password);
      setSuccess(true);
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader>
              <CardTitle>Contrasena actualizada</CardTitle>
              <CardDescription>Tu contrasena se restablecio correctamente.</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild className="w-full">
                <Link to="/sign-in">Iniciar sesion</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Restablecer contrasena</CardTitle>
            <CardDescription>
              {token
                ? 'Ingresa tu nueva contrasena.'
                : 'Falta el token en la URL. Solicita un nuevo enlace de restablecimiento.'}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-password">Nueva contrasena</Label>
                <Input
                  id="reset-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reset-confirm-password">Confirmar contrasena</Label>
                <Input
                  id="reset-confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="••••••••"
                />
              </div>
              {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
            </CardContent>
            <CardFooter className="mt-4">
              <Button type="submit" className="w-full" disabled={isSubmitting || !token}>
                {isSubmitting ? 'Actualizando...' : 'Actualizar contrasena'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
