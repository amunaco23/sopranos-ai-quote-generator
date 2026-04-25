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

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown';

  const { allowed, retryAfter } = checkRateLimit(ip);
  if (!allowed) {
    const template = RATE_LIMIT_MESSAGES[Math.floor(Math.random() * RATE_LIMIT_MESSAGES.length)];
    const message = template.replace('{X}', String(retryAfter));
    return NextResponse.json({ message, retryAfter }, { status: 429 });
  }

  let body: { message?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
  }

  const { message } = body;
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return NextResponse.json({ message: 'Message is required.' }, { status: 400 });
  }

  const quotes = quotesData.quotes as Quote[];

  let matchedIds: number[];
  try {
    matchedIds = await matchQuotes(message.trim(), quotes);
  } catch (err) {
    console.error('Groq error:', err);
    return NextResponse.json(
      { message: 'Even Tony has bad days. Try again.' },
      { status: 500 }
    );
  }

  const matched = matchedIds
    .map(id => quotes.find(q => q.id === id))
    .filter((q): q is Quote => q !== undefined);

  return NextResponse.json({ quotes: matched });
}
