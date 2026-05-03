'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Quote } from '@/lib/types';
import { CHARACTER_IMAGES, getInitials } from '@/lib/characterData';

interface Props {
  quote: Quote;
  showAvatar?: boolean;
}

function CopyIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CopyCheck() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#C41E1E"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ animation: 'checkIn 0.2s ease-out forwards' }}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

const AVATAR_SIZE = 44;

export default function QuoteCard({ quote, showAvatar = true }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(quote.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const attribution = (() => {
    if (quote.season && quote.episode) {
      const ep = quote.episode_title
        ? `S${quote.season}E${quote.episode} "${quote.episode_title}"`
        : `S${quote.season}E${quote.episode}`;
      return `— ${quote.character}, ${ep}`;
    }
    return `— ${quote.character}`;
  })();

  const imgSrc = CHARACTER_IMAGES[quote.character];

  return (
    <div className="bg-[#1A1A1A] border border-[#272727] rounded-xl p-5 flex items-center gap-3">
      {/* Character avatar — only on main search results */}
      {showAvatar && (
        <div
          className="flex-shrink-0 self-center rounded-full overflow-hidden ring-1 ring-white/10"
          style={{
            width: AVATAR_SIZE,
            height: AVATAR_SIZE,
            filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.5))',
          }}
        >
          {imgSrc ? (
            <Image
              src={imgSrc}
              alt={quote.character}
              width={AVATAR_SIZE * 2}
              height={AVATAR_SIZE * 2}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#2a2a2a] text-[#777] text-[11px] font-semibold">
              {getInitials(quote.character)}
            </div>
          )}
        </div>
      )}

      {/* Text block */}
      <div className="flex-1 min-w-0">
        <p className="text-white text-base leading-relaxed">
          &ldquo;{quote.text}&rdquo;
        </p>
        <p className="text-[#666666] text-xs mt-1.5">{attribution}</p>
        {quote.context && (
          <p className="text-[#444444] text-xs mt-1">{quote.context}</p>
        )}
      </div>

      {/* Copy button */}
      <button
        onClick={handleCopy}
        className="flex-shrink-0 self-center text-[#444444] hover:text-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
        aria-label="Copy quote"
      >
        {copied ? <CopyCheck /> : <CopyIcon />}
      </button>
    </div>
  );
}
