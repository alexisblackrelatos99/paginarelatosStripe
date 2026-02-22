import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function VerifiedPage() {
  return (
    <div className="container mx-auto px-4 py-20">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Correo verificado correctamente</CardTitle>
          <CardDescription>
            Tu cuenta ya esta activada. Puedes iniciar sesion con tus credenciales.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link to="/sign-in">Ir a iniciar sesion</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
