'use client';

import { useState, useCallback } from 'react';
import QuoteInput from '@/components/QuoteInput';
import QuoteCard from '@/components/QuoteCard';
import RateLimitToast from '@/components/RateLimitToast';
import Logo from '@/components/Logo';
import SpotlightCharacterMode from '@/components/SpotlightCharacterMode';
import { Quote } from '@/lib/types';
import quotesData from '@/data/quotes.json';

const PINNED = ['Tony Soprano', 'Christopher Moltisanti', 'Uncle Junior'];

const EXCLUDED_FROM_FILTER = new Set([
  'Dr. Krakower',
  'Angie Bompensiero',
  'Brendan Filone',
  'Raymond Curto',
  'Meadow Soprano',
  'Rosalie Aprile',
  'Bakery worker',
  'Da Lux',
  'Bob Wegler',
]);

const allQuotes = quotesData.quotes as Quote[];

const quoteCounts = allQuotes.reduce<Record<string, number>>((acc, q) => {
  acc[q.character] = (acc[q.character] ?? 0) + 1;
  return acc;
}, {});

const ALL_CHARACTERS = [
  ...PINNED,
  ...[...new Set(
    allQuotes
      .map(q => q.character)
      .filter(c => !PINNED.includes(c) && !EXCLUDED_FROM_FILTER.has(c))
  )].sort((a, b) => (quoteCounts[b] ?? 0) - (quoteCounts[a] ?? 0)),
];

export default function Home() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [characterMismatch, setCharacterMismatch] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState<{ message: string; retryAfter: number } | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [lastBody, setLastBody] = useState<object | null>(null);
  const [browseMode, setBrowseMode] = useState<'default' | 'browse'>('default');

  const callApi = useCallback(async (body: object) => {
    setLoading(true);
    setError(null);
    setQuotes([]);
    setCharacterMismatch(false);
    setHasSubmitted(true);
    setLastBody(body);

    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
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
        setError(data.message || 'Everything turns to shit. Try again.');
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
  }, []);

  const handleShowMore = useCallback(async () => {
    if (!lastBody || loadingMore) return;
    setLoadingMore(true);
    try {
      const excludeIds = quotes.map(q => q.id).filter(Boolean);
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...lastBody, excludeIds }),
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.quotes?.length) {
        setQuotes(prev => [...prev, ...data.quotes]);
      }
    } catch {
      // silently fail
    } finally {
      setLoadingMore(false);
    }
  }, [lastBody, quotes, loadingMore]);

  const handleSubmit = useCallback((message: string, character: string | null) => {
    callApi({ message, character });
  }, [callApi]);

  const handleSurpriseMe = useCallback((character: string | null) => {
    callApi({ surpriseMe: true, character });
  }, [callApi]);

  const handleViewAll = useCallback(() => setBrowseMode('browse'), []);
  const handleCloseGrid = useCallback(() => setBrowseMode('default'), []);

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-white flex flex-col items-center px-4 pb-16">
      <div
        className="w-full max-w-[640px] transition-all duration-500 ease-out"
        style={{ marginTop: hasSubmitted ? '3rem' : '26vh' }}
      >
        <Logo />

        <QuoteInput
          onSubmit={handleSubmit}
          onSurpriseMe={handleSurpriseMe}
          onViewAll={handleViewAll}
          disabled={loading}
          allCharacters={ALL_CHARACTERS}
        />

        {/* Results */}
        <div className="mt-6">
          {!loading && error && (
            <div className="p-4 rounded-xl bg-[#1A1A1A] border border-[#272727] text-[#666] text-center text-sm">
              {error}
            </div>
          )}

          {!loading && characterMismatch && (
            <p className="text-[#444] text-xs mb-3">
              No exact match for that character — showing closest results from the crew.
            </p>
          )}

          {!loading && quotes.length > 0 && (
            <>
              <div className="space-y-3">
                {quotes.map((quote, i) => (
                  <QuoteCard key={quote.id ?? i} quote={quote} />
                ))}
              </div>

              {/* Show More */}
              <div className="flex justify-center mt-4">
                <button
                  onClick={handleShowMore}
                  disabled={loadingMore}
                  className="text-[#555] text-sm hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loadingMore ? 'Finding more...' : 'Show more'}
                </button>
              </div>
            </>
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

      {browseMode === 'browse' && (
        <SpotlightCharacterMode
          allCharacters={ALL_CHARACTERS}
          quoteCounts={quoteCounts}
          allQuotes={allQuotes}
          onClose={handleCloseGrid}
        />
      )}
    </main>
  );
}
