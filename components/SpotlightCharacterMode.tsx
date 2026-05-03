'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import QuoteCard from './QuoteCard';
import { CHARACTER_IMAGES, getInitials } from '@/lib/characterData';
import { Quote } from '@/lib/types';

interface Props {
  allCharacters: string[];
  quoteCounts: Record<string, number>;
  allQuotes: Quote[];
  onClose: () => void; // grid → default
}

// Override display names for characters where first name isn't the right label
const GRID_DISPLAY_NAMES: Record<string, string> = {
  'Uncle Junior': 'Junior',
  'Ralph Cifaretto': 'Ralphie',
  'Big Pussy Bonpensiero': 'Pussy',
  'Dr. Jennifer Melfi': 'Dr. Melfi',
};

function getGridFirstName(name: string): string {
  if (GRID_DISPLAY_NAMES[name]) return GRID_DISPLAY_NAMES[name];
  return name.replace(/^Dr\.\s*/, '').split(' ')[0];
}

// ── Shared back button ───────────────────────────────────────────────────────
function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-[#555] text-sm hover:text-white transition-colors"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Back
    </button>
  );
}

// ── Internal grid cell ───────────────────────────────────────────────────────
function CharacterGridCell({ name, onClick }: { name: string; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  const imgSrc = CHARACTER_IMAGES[name];
  const firstName = getGridFirstName(name);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className={[
          'rounded-full flex-shrink-0 transition-shadow duration-150',
          hovered
            ? 'ring-2 ring-[#C41E1E] ring-offset-2 ring-offset-[#0D0D0D]'
            : 'ring-1 ring-white/10',
        ].join(' ')}
        style={{ width: 80, height: 80 }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <button
          onClick={onClick}
          className="w-full h-full rounded-full overflow-hidden focus:outline-none block"
          style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.6))' }}
        >
          {imgSrc ? (
            <Image src={imgSrc} alt={name} width={160} height={160} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#2a2a2a] text-white text-sm font-semibold">
              {getInitials(name)}
            </div>
          )}
        </button>
      </div>
      <span className="text-[11px] text-[#888] text-center leading-tight">{firstName}</span>
    </div>
  );
}

// ── Main export ──────────────────────────────────────────────────────────────
export default function SpotlightCharacterMode({ allCharacters, quoteCounts, allQuotes, onClose }: Props) {
  // All grid/spotlight state lives here — the fixed overlay never unmounts
  const [view, setView] = useState<'grid' | 'spotlight'>('grid');
  const [selectedChar, setSelectedChar] = useState<string | null>(null);
  const [gridExiting, setGridExiting] = useState(false);
  // key forces SpotlightView to remount (re-run animations) when switching characters
  const [spotlightKey, setSpotlightKey] = useState(0);

  const characterQuotes = useMemo(
    () => (selectedChar ? allQuotes.filter(q => q.character === selectedChar) : []),
    [allQuotes, selectedChar]
  );

  const handleCharacterTap = (name: string) => {
    setGridExiting(true);
    setSelectedChar(name);
  };

  const handleGridAnimationEnd = () => {
    if (gridExiting) {
      setView('spotlight');
      setGridExiting(false);
      setSpotlightKey(k => k + 1);
    }
  };

  const handleBackToGrid = () => {
    setView('grid');
    setSelectedChar(null);
  };

  return (
    // Single fixed overlay — never unmounts during grid↔spotlight transition
    <div className="fixed inset-0 z-50 bg-[#0D0D0D]">

      {/* ── Grid view ── */}
      <div
        className="absolute inset-0 overflow-y-auto"
        style={{
          animationName: gridExiting ? 'gridFadeOut' : 'gridFadeIn',
          animationDuration: '200ms',
          animationTimingFunction: 'ease',
          animationFillMode: 'both',
          // Hidden behind spotlight when in spotlight view
          visibility: view === 'spotlight' && !gridExiting ? 'hidden' : 'visible',
          pointerEvents: view === 'spotlight' ? 'none' : 'auto',
        }}
        onAnimationEnd={handleGridAnimationEnd}
      >
        <div className="max-w-[640px] mx-auto px-4 pt-6 pb-16">
          <div className="relative flex items-center mb-6">
            <BackButton onClick={onClose} />
            <p className="absolute left-1/2 -translate-x-1/2 text-[#444] text-xs pointer-events-none">
              <span className="hidden sm:inline">Tap a character to see their quotes</span>
              <span className="sm:hidden">Tap to see quotes</span>
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))', gap: '1.5rem' }}>
            {allCharacters.map(name => (
              <CharacterGridCell key={name} name={name} onClick={() => handleCharacterTap(name)} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Spotlight view — rendered on top, animations reset via key ── */}
      {view === 'spotlight' && selectedChar && (
        <div key={spotlightKey} className="absolute inset-0 overflow-y-auto">
          <div className="max-w-[640px] mx-auto px-4 pt-6 pb-16">
            <div className="mb-6">
              <BackButton onClick={handleBackToGrid} />
            </div>

            {/* Hero row */}
            <div
              className="flex items-center gap-4 mb-6"
              style={{
                animationName: 'heroSlideIn',
                animationDuration: '250ms',
                animationTimingFunction: 'ease',
                animationDelay: '0ms',
                animationFillMode: 'both',
              }}
            >
              <div
                className="flex-shrink-0 rounded-full ring-2 ring-[#C41E1E] ring-offset-2 ring-offset-[#0D0D0D]"
                style={{ width: 72, height: 72 }}
              >
                <div className="w-full h-full rounded-full overflow-hidden">
                  {CHARACTER_IMAGES[selectedChar] ? (
                    <Image
                      src={CHARACTER_IMAGES[selectedChar]}
                      alt={selectedChar}
                      width={144}
                      height={144}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#2a2a2a] text-white text-base font-semibold">
                      {getInitials(selectedChar)}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <p className="text-white text-xl font-semibold leading-tight">{selectedChar}</p>
                <p className="text-[#555] text-sm mt-1">
                  {quoteCounts[selectedChar] ?? characterQuotes.length} quote{(quoteCounts[selectedChar] ?? characterQuotes.length) !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Quote cards */}
            <div className="space-y-3">
              {characterQuotes.map((quote, i) => (
                <div
                  key={quote.id ?? i}
                  style={{
                    animationName: 'quoteCardIn',
                    animationDuration: '200ms',
                    animationTimingFunction: 'ease',
                    animationDelay: `${250 + i * 50}ms`,
                    animationFillMode: 'both',
                  }}
                >
                  <QuoteCard quote={quote} showAvatar={false} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
