import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storiesApi } from '../../api/stories-api';
import { useAuth } from '@/contexts/auth-context';
import { getAuthErrorMessage } from '@/lib/auth-errors';
import { isAlexisCustomer } from '@/lib/auth-helpers';
import { getReadingTimeMinutesFromText } from '@/data/catalog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Price } from '@/components/commerce/price';

const NARRATIVE_PARAGRAPH_INDENT = '\t';
const NARRATIVE_PARAGRAPH_BREAK = `\n\n${NARRATIVE_PARAGRAPH_INDENT}`;
const PRICE_BLOCK_WORDS = 30_000;
const PRICE_BLOCK_CENTS = 300;

function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function calculatePriceByWordsInCents(wordCount: number): number {
  if (wordCount <= 0) {
    return 0;
  }
  const cents = Math.round((wordCount * PRICE_BLOCK_CENTS) / PRICE_BLOCK_WORDS);
  return Math.max(1, cents);
}

export function AccountCreateStoryPage() {
  const navigate = useNavigate();
  const { activeCustomer } = useAuth();
  const [title, setTitle] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!activeCustomer) {
    return null;
  }

  const canPublish = isAlexisCustomer(activeCustomer);
  const wordCount = countWords(body);
  const estimatedReadingTime = getReadingTimeMinutesFromText(body);
  const estimatedTotalPriceInCents = calculatePriceByWordsInCents(wordCount);

  if (!canPublish) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sin permisos de publicacion</CardTitle>
          <CardDescription>Solo el usuario Alexis puede crear relatos.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!title.trim() || !synopsis.trim() || !body.trim()) {
      setErrorMessage('Completa titulo, sinopsis y cuerpo.');
      return;
    }

    const accessToken = activeCustomer.accessToken;
    if (!accessToken) {
      setErrorMessage('No hay sesion activa.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const createdStory = await storiesApi.createStory(accessToken, {
        title: title.trim(),
        synopsis: synopsis.trim(),
        body,
      });

      navigate(`/product/${createdStory.slug}`);
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBodyFocus = () => {
    if (body.length === 0) {
      setBody(NARRATIVE_PARAGRAPH_INDENT);
    }
  };

  const handleBodyKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Tab') {
      event.preventDefault();

      const textarea = event.currentTarget;
      const { selectionStart, selectionEnd, value } = textarea;
      const nextValue =
        value.slice(0, selectionStart) + NARRATIVE_PARAGRAPH_INDENT + value.slice(selectionEnd);

      setBody(nextValue);

      const cursorPosition = selectionStart + NARRATIVE_PARAGRAPH_INDENT.length;
      window.requestAnimationFrame(() => {
        textarea.setSelectionRange(cursorPosition, cursorPosition);
      });
      return;
    }

    if (event.key !== 'Enter') {
      return;
    }

    event.preventDefault();

    const textarea = event.currentTarget;
    const { selectionStart, selectionEnd, value } = textarea;
    const nextValue =
      value.slice(0, selectionStart) + NARRATIVE_PARAGRAPH_BREAK + value.slice(selectionEnd);

    setBody(nextValue);

    const cursorPosition = selectionStart + NARRATIVE_PARAGRAPH_BREAK.length;
    window.requestAnimationFrame(() => {
      textarea.setSelectionRange(cursorPosition, cursorPosition);
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Publicar nuevo relato</CardTitle>
        <CardDescription>
          El tiempo de lectura y el precio final se calculan automaticamente al guardar.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="story-title">Titulo</Label>
            <Input
              id="story-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Titulo del relato"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="story-synopsis">Sinopsis</Label>
            <Textarea
              id="story-synopsis"
              value={synopsis}
              onChange={(event) => setSynopsis(event.target.value)}
              placeholder="Resumen breve del relato"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="story-body">Cuerpo</Label>
            <Textarea
              id="story-body"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              onFocus={handleBodyFocus}
              onKeyDown={handleBodyKeyDown}
              placeholder="Texto completo del relato"
              rows={12}
              className="font-mono"
            />
          </div>

          <div className="rounded-md border p-3 text-sm text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">Palabras:</span> {wordCount}
            </p>
            <p>
              <span className="font-medium text-foreground">Estimado de lectura:</span> {estimatedReadingTime} min
            </p>
            <p>
              <span className="font-medium text-foreground">Precio estimado:</span>{' '}
              <Price value={estimatedTotalPriceInCents} />
            </p>
          </div>

          {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Publicando...' : 'Publicar relato'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
