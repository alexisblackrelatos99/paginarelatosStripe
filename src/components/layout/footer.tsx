import { BookOpen } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-2 text-sm text-muted-foreground">
          <div>© {new Date().getFullYear()} Todos los derechos reservados.</div>
          <div className="flex items-center justify-center gap-1.5">
            <BookOpen className="h-4 w-4" aria-label="Book icon" />
            <span className="text-sm font-medium leading-none">Relatos Alexis</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
