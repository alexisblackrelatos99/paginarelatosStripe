import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function NotFoundPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <h2 className="text-2xl font-semibold">Pagina no encontrada</h2>
        <p className="text-muted-foreground">
          La pagina que buscas no existe o fue movida.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild>
            <Link to="/">Ir al inicio</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
