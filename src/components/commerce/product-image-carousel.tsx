'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ProductAsset } from '@/data/catalog';

interface ProductImageCarouselProps {
  images: ProductAsset[];
}

export function ProductImageCarousel({ images }: ProductImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
        <span className="text-muted-foreground">No hay imagenes disponibles</span>
      </div>
    );
  }

  const goToPrevious = () => {
    setCurrentIndex((previousIndex) =>
      previousIndex === 0 ? images.length - 1 : previousIndex - 1,
    );
  };

  const goToNext = () => {
    setCurrentIndex((previousIndex) =>
      previousIndex === images.length - 1 ? 0 : previousIndex + 1,
    );
  };

  return (
    <div className="space-y-4">
      <div className="relative aspect-square bg-muted rounded-lg overflow-hidden group">
        <img
          src={images[currentIndex].source}
          alt={`Imagen del producto ${currentIndex + 1}`}
          className="h-full w-full object-cover"
        />

        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={goToNext}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </>
        )}

        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 px-3 py-1 rounded-full text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setCurrentIndex(index)}
              className={`aspect-square relative rounded-lg overflow-hidden border-2 transition-colors ${
                index === currentIndex ? 'border-primary' : 'border-transparent hover:border-muted-foreground'
              }`}
            >
              <img src={image.preview} alt={`Miniatura ${index + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
