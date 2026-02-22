import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function getErrorMessage(reason: string | null): string {
  switch ((reason ?? '').toUpperCase()) {
    case 'TOKEN_EXPIRED':
      return 'El enlace de verificacion ha caducado. Solicita un nuevo correo de verificacion.';
    case 'TOKEN_ALREADY_USED':
      return 'Este enlace ya fue utilizado. Si ya verificaste tu cuenta, inicia sesion.';
    case 'INVALID_TOKEN':
      return 'El token de verificacion no es valido.';
    default:
      return 'No se pudo verificar tu correo. Solicita un nuevo enlace de verificacion.';
  }
}

export function VerifyErrorPage() {
  const [searchParams] = useSearchParams();
  const reason = searchParams.get('reason');

  return (
    <div className="container mx-auto px-4 py-20">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Error al verificar correo</CardTitle>
          <CardDescription>{getErrorMessage(reason)}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button asChild className="w-full">
            <Link to="/verify-pending">Reenviar verificacion</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link to="/sign-in">Ir a iniciar sesion</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
