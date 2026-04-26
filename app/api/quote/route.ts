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

function filterByCharacter(quotes: Quote[], character: string): Quote[] {
  return quotes.filter(q => q.character.toLowerCase().includes(character.toLowerCase()));
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

  let body: { message?: unknown; character?: unknown; surpriseMe?: unknown; excludeIds?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
  }

  const character = typeof body.character === 'string' ? body.character.trim() : null;
  const surpriseMe = body.surpriseMe === true;
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  const hasMessage = message.length > 0;
  const excludeIds = Array.isArray(body.excludeIds) ? (body.excludeIds as number[]) : [];

  const allQuotes = (quotesData.quotes as Quote[]).filter(
    q => excludeIds.length === 0 || q.id === undefined || !excludeIds.includes(q.id)
  );

  // Surprise Me — random quote(s), optionally filtered by character
  if (surpriseMe || (!hasMessage && character)) {
    const pool = character ? filterByCharacter(allQuotes, character) : allQuotes;
    if (pool.length === 0) {
      return NextResponse.json(
        { message: 'No quotes found for that character.' },
        { status: 404 }
      );
    }
    return NextResponse.json({ quotes: randomPick(pool, 1) });
  }

  if (!hasMessage) {
    return NextResponse.json({ message: 'Message is required.' }, { status: 400 });
  }

  // LLM matching — character-filtered pool or full
  const characterPool = character ? filterByCharacter(allQuotes, character) : allQuotes;
  const useFullFallback = characterPool.length < 3;
  const quotePool = useFullFallback ? allQuotes : characterPool;

  let matchedIds: number[];
  try {
    matchedIds = await matchQuotes(message, quotePool);
  } catch (err) {
    console.error('Groq error:', err);
    return NextResponse.json(
      { message: 'Everything turns to shit. Try again.' },
      { status: 500 }
    );
  }

  const matched = matchedIds
    .map(id => quotePool.find(q => q.id === id))
    .filter((q): q is Quote => q !== undefined);

  const characterMismatch =
    !!character &&
    !useFullFallback &&
    matched.every(q => !q.character.toLowerCase().includes(character.toLowerCase()));

  return NextResponse.json({ quotes: matched, characterMismatch: characterMismatch || undefined });
}
