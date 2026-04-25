import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { matchQuotes } from '@/lib/groq';
import quotesData from '@/data/quotes.json';
import { Quote } from '@/lib/types';

const RATE_LIMIT_MESSAGES = [
  "Take it easy. You're not the only one in line. Try again in {X} seconds.",
  "You're crowdin' me. Come back in {X} seconds.",
  "Slow down. You'll get your turn in {X} seconds.",
];

function filterByCharacters(quotes: Quote[], characters: string[]): Quote[] {
  return quotes.filter(q =>
    characters.some(c => q.character.toLowerCase().includes(c.toLowerCase()))
  );
}

function randomPick(quotes: Quote[], n: number): Quote[] {
  return [...quotes].sort(() => Math.random() - 0.5).slice(0, n);
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown';

  const { allowed, retryAfter } = checkRateLimit(ip);
  if (!allowed) {
    const template = RATE_LIMIT_MESSAGES[Math.floor(Math.random() * RATE_LIMIT_MESSAGES.length)];
    return NextResponse.json(
      { message: template.replace('{X}', String(retryAfter)), retryAfter },
      { status: 429 }
    );
  }

  let body: { message?: unknown; characters?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
  }

  const characters =
    Array.isArray(body.characters) && body.characters.every(c => typeof c === 'string')
      ? (body.characters as string[])
      : [];

  const message = typeof body.message === 'string' ? body.message.trim() : '';
  const hasMessage = message.length > 0;
  const hasCharacters = characters.length > 0;

  const allQuotes = quotesData.quotes as Quote[];

  // Characters selected, no message → return random quotes from those characters
  if (!hasMessage && hasCharacters) {
    const pool = filterByCharacters(allQuotes, characters);
    if (pool.length === 0) {
      return NextResponse.json(
        { message: 'No quotes found for the selected characters.' },
        { status: 404 }
      );
    }
    return NextResponse.json({ quotes: randomPick(pool, 3) });
  }

  if (!hasMessage) {
    return NextResponse.json({ message: 'Message is required.' }, { status: 400 });
  }

  // Determine quote pool — character-filtered or full
  const characterPool = hasCharacters ? filterByCharacters(allQuotes, characters) : allQuotes;
  const useFullFallback = characterPool.length < 3;
  const quotePool = useFullFallback ? allQuotes : characterPool;

  let matchedIds: number[];
  try {
    matchedIds = await matchQuotes(message, quotePool);
  } catch (err) {
    console.error('Groq error:', err);
    return NextResponse.json(
      { message: 'Even Tony has bad days. Try again.' },
      { status: 500 }
    );
  }

  const matched = matchedIds
    .map(id => quotePool.find(q => q.id === id))
    .filter((q): q is Quote => q !== undefined);

  // Check if any result actually belongs to the selected characters
  const characterMismatch =
    hasCharacters &&
    !useFullFallback &&
    matched.every(q => !characters.some(c => q.character.toLowerCase().includes(c.toLowerCase())));

  return NextResponse.json({ quotes: matched, characterMismatch: characterMismatch || undefined });
}
