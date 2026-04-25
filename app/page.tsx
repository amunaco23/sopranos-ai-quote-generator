'use client';

import { useState, useCallback } from 'react';
import QuoteInput from '@/components/QuoteInput';
import QuoteCard from '@/components/QuoteCard';
import LoadingState from '@/components/LoadingState';
import RateLimitToast from '@/components/RateLimitToast';
import Logo from '@/components/Logo';
import CharacterFilter from '@/components/CharacterFilter';
import { Quote } from '@/lib/types';
import quotesData from '@/data/quotes.json';

const PINNED = ['Tony Soprano', 'Junior Soprano', 'Christopher Moltisanti'];

const ALL_CHARACTERS = [
  ...PINNED,
  ...[...new Set(
    (quotesData.quotes as Quote[])
      .map(q => q.character)
      .filter(c => !c.includes('/') && !PINNED.includes(c))
  )].sort(),
];

export default function Home() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [characterMismatch, setCharacterMismatch] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState<{ message: string; retryAfter: number } | null>(null);
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleToggleCharacter = useCallback((character: string) => {
    setSelectedCharacters(prev => {
      if (prev.includes(character)) return prev.filter(c => c !== character);
      if (prev.length >= 3) return prev;
      return [...prev, character];
    });
  }, []);

  const handleClearCharacters = useCallback(() => {
    setSelectedCharacters([]);
  }, []);

  const handleSubmit = useCallback(async (message: string) => {
    setLoading(true);
    setError(null);
    setQuotes([]);
    setCharacterMismatch(false);
    setHasSubmitted(true);

    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, characters: selectedCharacters }),
      });

      if (res.status === 429) {
        const data = await res.json();
        setRateLimitInfo({
          message: data.message || "You're crowdin' me. Come back in a bit.",
          retryAfter: data.retryAfter || 60,
        });
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || 'Even Tony has bad days. Try again.');
        return;
      }

      const data = await res.json();
      setQuotes(data.quotes ?? []);
      setCharacterMismatch(!!data.characterMismatch);
    } catch {
      setError('The line went dead. Check your connection.');
    } finally {
      setLoading(false);
    }
  }, [selectedCharacters]);

  // Trigger random quotes when a character is selected with no input
  const handleRandomFromCharacter = useCallback(async (characters: string[]) => {
    if (characters.length === 0) return;
    setLoading(true);
    setError(null);
    setQuotes([]);
    setCharacterMismatch(false);
    setHasSubmitted(true);

    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: '', characters }),
      });
      if (res.ok) {
        const data = await res.json();
        setQuotes(data.quotes ?? []);
      }
    } catch {
      // silent fail for random quotes
    } finally {
      setLoading(false);
    }
  }, []);

  const handleToggleWithRandom = useCallback((character: string) => {
    setSelectedCharacters(prev => {
      const next = prev.includes(character)
        ? prev.filter(c => c !== character)
        : prev.length < 3 ? [...prev, character] : prev;

      // If no text in the box, fire random quotes immediately
      if (next.length > 0) {
        handleRandomFromCharacter(next);
      } else {
        setQuotes([]);
        setHasSubmitted(false);
      }

      return next;
    });
  }, [handleRandomFromCharacter]);

  const handleClearWithReset = useCallback(() => {
    setSelectedCharacters([]);
    setQuotes([]);
    setHasSubmitted(false);
    setError(null);
  }, []);

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center px-4 pb-16">
      {/* Content block — slides from vertically centered to top on first submit */}
      <div
        className="w-full max-w-[640px] transition-all duration-500 ease-out"
        style={{ marginTop: hasSubmitted ? '3rem' : '28vh' }}
      >
        <Logo />

        <QuoteInput onSubmit={handleSubmit} disabled={loading} />

        <CharacterFilter
          allCharacters={ALL_CHARACTERS}
          selected={selectedCharacters}
          onToggle={handleToggleWithRandom}
          onClear={handleClearWithReset}
        />

        {/* Results area */}
        <div className="mt-6">
          {loading && <LoadingState />}

          {!loading && error && (
            <div className="p-4 rounded-lg bg-[#1A1A1A] border border-[#333333] text-[#A0A0A0] text-center text-sm">
              {error}
            </div>
          )}

          {!loading && characterMismatch && (
            <p className="text-[#555555] text-xs mb-3">
              No exact match for the selected character — showing closest results from the crew.
            </p>
          )}

          {!loading && quotes.length > 0 && (
            <div className="space-y-4">
              {quotes.map((quote, i) => (
                <QuoteCard key={quote.id ?? i} quote={quote} />
              ))}
            </div>
          )}
        </div>
      </div>

      {rateLimitInfo && (
        <RateLimitToast
          message={rateLimitInfo.message}
          retryAfter={rateLimitInfo.retryAfter}
          onDismiss={() => setRateLimitInfo(null)}
        />
      )}
    </main>
  );
}
