import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/auth-context';
import { getAuthErrorMessage } from '@/lib/auth-errors';

type VerifyStatus = 'idle' | 'loading' | 'success' | 'error';

export function VerifyPage() {
  const { verifyEmail } = useAuth();
  const [searchParams] = useSearchParams();
  const tokenFromQuery = searchParams.get('token')?.trim() ?? '';
  const autoVerificationRef = useRef<string | null>(null);
  const [status, setStatus] = useState<VerifyStatus>(tokenFromQuery ? 'loading' : 'idle');
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [tokenInput, setTokenInput] = useState(tokenFromQuery);

  const runVerification = async (token: string) => {
    const normalizedToken = token.trim();

    if (!normalizedToken) {
      setStatus('error');
      setErrorCode('INVALID_TOKEN');
      return;
    }

    setStatus('loading');
    setErrorCode(null);

    const result = await verifyEmail(normalizedToken);

    if (result.ok) {
      setStatus('success');
      return;
    }

    setStatus('error');
    setErrorCode(result.code ?? 'INVALID_TOKEN');
  };

  useEffect(() => {
    if (!tokenFromQuery || autoVerificationRef.current === tokenFromQuery) {
      return;
    }

    autoVerificationRef.current = tokenFromQuery;
    void runVerification(tokenFromQuery);
  }, [tokenFromQuery]);

  const titleByStatus: Record<VerifyStatus, string> = {
    idle: 'Verificacion requerida',
    loading: 'Verificando correo',
    success: 'Correo verificado',
    error: 'No se pudo verificar',
  };

  const descriptionByStatus: Record<VerifyStatus, string> = {
    idle: 'Pega el token de verificacion que recibiste en tu correo.',
    loading: 'Estamos validando tu token de verificacion.',
    success: 'Tu correo electronico se verifico correctamente.',
    error: getAuthErrorMessage({ code: errorCode ?? 'INVALID_TOKEN' }),
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await runVerification(tokenInput);
  };

  return (
    <div className="container mx-auto px-4 py-20">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>{titleByStatus[status]}</CardTitle>
          <CardDescription>{descriptionByStatus[status]}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {(status === 'idle' || status === 'error') && (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="verify-token">Token</Label>
                <Input
                  id="verify-token"
                  value={tokenInput}
                  onChange={(event) => setTokenInput(event.target.value)}
                  placeholder="Pega aqui tu token"
                />
              </div>
              <Button type="submit" className="w-full">
                Verificar correo
              </Button>
            </form>
          )}

          {status === 'loading' && (
            <Button className="w-full" disabled>
              Verificando...
            </Button>
          )}

          {status === 'success' && (
            <Button asChild className="w-full">
              <Link to="/sign-in">Ir a iniciar sesion</Link>
            </Button>
          )}

          <Button asChild variant="outline" className="w-full">
            <Link to="/verify-pending">Reenviar verificacion</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
