import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/auth-context';
import { getAuthErrorMessage } from '@/lib/auth-errors';

export function VerifyPendingPage() {
  const [searchParams] = useSearchParams();
  const { pendingEmailAddress, requestEmailVerification } = useAuth();

  const [emailAddress, setEmailAddress] = useState(searchParams.get('email') ?? pendingEmailAddress);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!emailAddress && pendingEmailAddress) {
      setEmailAddress(pendingEmailAddress);
    }
  }, [emailAddress, pendingEmailAddress]);

  const handleResend = async () => {
    if (!emailAddress.trim()) {
      setErrorMessage('Ingresa el correo para reenviar la verificacion.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setMessage('');

    try {
      await requestEmailVerification(emailAddress);
      setMessage('Si existe una cuenta pendiente, se envio un nuevo correo de verificacion.');
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-20">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Verifica tu correo</CardTitle>
          <CardDescription>
            Enviamos un correo de verificacion a tu bandeja de entrada. Haz clic en el enlace para activar tu cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="verify-pending-email">Correo electronico</Label>
            <Input
              id="verify-pending-email"
              type="email"
              value={emailAddress}
              onChange={(event) => setEmailAddress(event.target.value)}
              placeholder="tu@email.com"
            />
          </div>

          {message && <p className="text-sm text-muted-foreground">{message}</p>}
          {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

          <Button className="w-full" variant="outline" onClick={handleResend} disabled={isSubmitting}>
            {isSubmitting ? 'Reenviando...' : 'Reenviar verificacion'}
          </Button>

          <Button asChild className="w-full" variant="secondary">
            <Link to="/sign-in">Volver a iniciar sesion</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
