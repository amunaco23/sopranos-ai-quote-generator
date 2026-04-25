'use client';

import { useState, useCallback } from 'react';
import QuoteInput from '@/components/QuoteInput';
import QuoteCard from '@/components/QuoteCard';
import LoadingState from '@/components/LoadingState';
import RateLimitToast from '@/components/RateLimitToast';
import Logo from '@/components/Logo';
import { Quote } from '@/lib/types';

export default function Home() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitInfo, setRateLimitInfo] = useState<{ message: string; retryAfter: number } | null>(null);

  const handleSubmit = useCallback(async (message: string) => {
    setLoading(true);
    setError(null);
    setQuotes([]);

    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
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
      setQuotes(data.quotes);
    } catch {
      setError('The line went dead. Check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center px-4 py-12">
      <div className="w-full max-w-[640px]">
        <Logo />
        <QuoteInput onSubmit={handleSubmit} disabled={loading} />

        {loading && <LoadingState />}

        {error && !loading && (
          <div className="mt-6 p-4 rounded-lg bg-[#1A1A1A] border border-[#333333] text-[#A0A0A0] text-center text-sm">
            {error}
          </div>
        )}

        {!loading && quotes.length > 0 && (
          <div className="mt-6 space-y-4">
            {quotes.map((quote, i) => (
              <QuoteCard key={quote.id ?? i} quote={quote} />
            ))}
          </div>
        )}
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
