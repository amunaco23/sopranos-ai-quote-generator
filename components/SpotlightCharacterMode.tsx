'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import QuoteCard from './QuoteCard';
import { CHARACTER_IMAGES, getInitials } from '@/lib/characterData';
import { Quote } from '@/lib/types';

interface Props {
  mode: 'grid' | 'spotlight';
  allCharacters: string[];
  quoteCounts: Record<string, number>;
  allQuotes: Quote[];
  spotlightCharacter: string | null;
  onSelectCharacter: (name: string) => void;
  onBack: () => void;   // spotlight → grid
  onClose: () => void;  // grid → default
}

// Override display names for characters where first name isn't the right label
const GRID_DISPLAY_NAMES: Record<string, string> = {
  'Uncle Junior': 'Junior',
  'Ralph Cifaretto': 'Ralphie',
  'Big Pussy Bonpensiero': 'Pussy',
};

function getGridFirstName(name: string): string {
  if (GRID_DISPLAY_NAMES[name]) return GRID_DISPLAY_NAMES[name];
  return name.replace(/^Dr\.\s*/, '').split(' ')[0];
}

// ── Internal grid cell ──────────────────────────────────────────────────────
function CharacterGridCell({
  name,
  onClick,
}: {
  name: string;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const imgSrc = CHARACTER_IMAGES[name];
  const firstName = getGridFirstName(name);

  return (
    <div className="flex flex-col items-center gap-1.5">
      {/* Ring lives on outer div; overflow+filter on inner button — same pattern as CharacterAvatars */}
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
          style={{
            filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.6))',
          }}
        >
          {imgSrc ? (
            <Image
              src={imgSrc}
              alt={name}
              width={160}
              height={160}
              className="w-full h-full object-cover"
            />
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

// ── Grid view ────────────────────────────────────────────────────────────────
function GridView({
  allCharacters,
  onSelectCharacter,
  onClose,
}: {
  allCharacters: string[];
  onSelectCharacter: (name: string) => void;
  onClose: () => void;
}) {
  const [gridExiting, setGridExiting] = useState(false);
  const [pendingChar, setPendingChar] = useState<string | null>(null);

  const handleCharacterTap = (name: string) => {
    setGridExiting(true);
    setPendingChar(name);
  };

  const handleAnimationEnd = () => {
    if (gridExiting && pendingChar) {
      onSelectCharacter(pendingChar);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-[#0D0D0D]"
      style={{
        animationName: gridExiting ? 'gridFadeOut' : 'gridFadeIn',
        animationDuration: '200ms',
        animationTimingFunction: 'ease',
        animationFillMode: 'both',
      }}
      onAnimationEnd={handleAnimationEnd}
    >
      <div className="max-w-[640px] mx-auto px-4 pt-6 pb-16">
        {/* Back button */}
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 text-[#555] text-sm hover:text-white transition-colors mb-6"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>

        {/* Hint */}
        <p className="text-center text-[#444] text-xs mb-6">
          <span className="hidden sm:inline">Tap a character to see their quotes</span>
          <span className="sm:hidden">Tap to see quotes</span>
        </p>

        {/* Character grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {allCharacters.map(name => (
            <CharacterGridCell
              key={name}
              name={name}
              onClick={() => handleCharacterTap(name)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Spotlight view ───────────────────────────────────────────────────────────
function SpotlightView({
  character,
  quoteCounts,
  characterQuotes,
  onBack,
}: {
  character: string;
  quoteCounts: Record<string, number>;
  characterQuotes: Quote[];
  onBack: () => void;
}) {
  const imgSrc = CHARACTER_IMAGES[character];
  const quoteCount = quoteCounts[character] ?? characterQuotes.length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0D0D0D]">
      <div className="max-w-[640px] mx-auto px-4 pt-6 pb-16">
        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-[#555] text-sm hover:text-white transition-colors mb-6"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>

        {/* Hero row */}
        <div
          className="flex items-center gap-4 mb-6"
          style={{
            animationName: 'heroSlideIn',
            animationDuration: '250ms',
            animationTimingFunction: 'ease',
            animationDelay: '200ms',
            animationFillMode: 'both',
          }}
        >
          {/* Avatar — ring on outer div, overflow on inner */}
          <div
            className="flex-shrink-0 rounded-full ring-2 ring-[#C41E1E] ring-offset-2 ring-offset-[#0D0D0D]"
            style={{ width: 72, height: 72 }}
          >
            <div className="w-full h-full rounded-full overflow-hidden">
              {imgSrc ? (
                <Image
                  src={imgSrc}
                  alt={character}
                  width={144}
                  height={144}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#2a2a2a] text-white text-base font-semibold">
                  {getInitials(character)}
                </div>
              )}
            </div>
          </div>

          {/* Name + count */}
          <div>
            <p className="text-white text-xl font-semibold leading-tight">{character}</p>
            <p className="text-[#555] text-sm mt-1">{quoteCount} quote{quoteCount !== 1 ? 's' : ''}</p>
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
                animationDelay: `${i * 50}ms`,
                animationFillMode: 'both',
              }}
            >
              <QuoteCard quote={quote} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main export ──────────────────────────────────────────────────────────────
export default function SpotlightCharacterMode({
  mode,
  allCharacters,
  quoteCounts,
  allQuotes,
  spotlightCharacter,
  onSelectCharacter,
  onBack,
  onClose,
}: Props) {
  const characterQuotes = useMemo(
    () => (spotlightCharacter ? allQuotes.filter(q => q.character === spotlightCharacter) : []),
    [allQuotes, spotlightCharacter]
  );

  if (mode === 'grid') {
    return (
      <GridView
        allCharacters={allCharacters}
        onSelectCharacter={onSelectCharacter}
        onClose={onClose}
      />
    );
  }

  if (mode === 'spotlight' && spotlightCharacter) {
    return (
      <SpotlightView
        character={spotlightCharacter}
        quoteCounts={quoteCounts}
        characterQuotes={characterQuotes}
        onBack={onBack}
      />
    );
  }

  return null;
}
