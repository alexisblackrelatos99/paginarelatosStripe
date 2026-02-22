import { useState } from 'react';
import { Link } from 'react-router-dom';
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

export function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth();
  const [emailAddress, setEmailAddress] = useState('');
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!emailAddress.trim()) {
      setErrorMessage('Ingresa un correo electronico.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await requestPasswordReset(emailAddress);
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
              <CardTitle>Revisa tu correo</CardTitle>
              <CardDescription>
                Si existe una cuenta con ese correo, enviamos instrucciones para restablecer la contrasena.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <div className="w-full space-y-3">
                <Button asChild className="w-full" variant="outline">
                  <Link to="/sign-in">Volver a iniciar sesion</Link>
                </Button>
              </div>
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
            <CardTitle>Olvidaste tu contrasena?</CardTitle>
            <CardDescription>
              Ingresa tu correo electronico y te enviaremos un enlace para restablecer la contrasena.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-2">
              <Label htmlFor="forgot-password-email">Correo electronico</Label>
              <Input
                id="forgot-password-email"
                type="email"
                value={emailAddress}
                onChange={(event) => setEmailAddress(event.target.value)}
                placeholder="tu@email.com"
              />
            </CardContent>
            <CardFooter className="flex flex-col gap-3 mt-4">
              {errorMessage && <p className="w-full text-sm text-destructive">{errorMessage}</p>}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Enviando...' : 'Enviar enlace de restablecimiento'}
              </Button>
              <Button asChild variant="ghost" className="w-full">
                <Link to="/sign-in">Volver a iniciar sesion</Link>
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
