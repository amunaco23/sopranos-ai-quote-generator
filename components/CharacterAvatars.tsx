'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';

// All character photos
const CHARACTER_IMAGES: Record<string, string> = {
  'Tony Soprano': '/Tony.png',
  'Christopher Moltisanti': '/Chrissy.png',
  'Uncle Junior': '/Uncle Junior.png',
  'Ralph Cifaretto': '/Ralphie.png',
  'Dr. Jennifer Melfi': '/Dr. Melfi.png',
  'Paulie Gualtieri': '/Paulie.png',
  'Carmine Lupertazzi': '/Carmine.png',
  'Silvio Dante': '/Silvio.png',
  'Phil Leotardo': '/Phil.png',
  'Johnny Sack': '/Johnny Sack.png',
  'Vito Spatafore': '/Vito.png',
  'Livia Soprano': '/Livia Soprano.png',
  'Furio Giunta': '/Furio.png',
  'Artie Bucco': '/Artie.png',
  'AJ Soprano': '/AJ.png',
  'Tony Blundetto': '/Tony B.png',
  'Patsy Parisi': '/Patsy.png',
  'Hesh Rabkin': '/Hesh.png',
  'Big Pussy Bonpensiero': '/Big Pussy.png',
  'Adriana La Cerva': '/Aidriana.png',
  'Richie Aprile': '/Richie.png',
  'Bobby Bacala': '/Bobby.png',
  'Feech La Manna': '/Feech.png',
  'Carmela Soprano': '/Carmela.png',
  'Eugene Pontecorvo': '/Eugene.png',
  'Mikey Palmice': '/Mikey.png',
};

const AVATAR_SIZE = 36;

function getInitials(name: string): string {
  return name
    .replace(/^Dr\.\s*/, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();
}

function AvatarTooltip({ name, anchorRect }: { name: string; anchorRect: DOMRect }) {
  const GAP = 6;
  return createPortal(
    <div
      style={{
        position: 'fixed',
        left: anchorRect.left + anchorRect.width / 2,
        top: anchorRect.top - GAP,
        transform: 'translate(-50%, -100%)',
        zIndex: 9999,
        pointerEvents: 'none',
      }}
      className="px-2 py-0.5 rounded-md bg-[#111] text-white text-[10px] leading-4 whitespace-nowrap border border-white/10 shadow-lg"
    >
      {name}
    </div>,
    document.body
  );
}

function Avatar({
  name,
  active,
  onClick,
}: {
  name: string;
  active: boolean;
  onClick: () => void;
}) {
  const imgSrc = CHARACTER_IMAGES[name];
  const btnRef = useRef<HTMLButtonElement>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

  const handleMouseEnter = () => {
    if (btnRef.current) setAnchorRect(btnRef.current.getBoundingClientRect());
  };
  const handleMouseLeave = () => setAnchorRect(null);

  return (
    <>
      <button
        ref={btnRef}
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={[
          'rounded-full flex-shrink-0 overflow-hidden transition-all duration-250',
          'focus:outline-none',
          active
            ? 'ring-2 ring-[#C41E1E] ring-offset-1 ring-offset-[#1C1C1C]'
            : 'ring-1 ring-white/10 hover:ring-white/30',
        ].join(' ')}
        style={{
          width: AVATAR_SIZE,
          height: AVATAR_SIZE,
          filter: active
            ? 'drop-shadow(0 4px 10px rgba(0,0,0,0.7)) drop-shadow(0 0 6px rgba(196,30,30,0.25))'
            : 'drop-shadow(0 2px 5px rgba(0,0,0,0.5))',
          transform: active ? 'translateY(-1px)' : 'translateY(0)',
        }}
      >
        {imgSrc ? (
          <Image
            src={imgSrc}
            alt={name}
            width={AVATAR_SIZE * 2}
            height={AVATAR_SIZE * 2}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className={[
              'w-full h-full flex items-center justify-center text-[11px] font-semibold',
              active ? 'bg-[#C41E1E] text-white' : 'bg-[#2a2a2a] text-[#777777]',
            ].join(' ')}
          >
            {getInitials(name)}
          </div>
        )}
      </button>

      {anchorRect && <AvatarTooltip name={name} anchorRect={anchorRect} />}
    </>
  );
}

interface Props {
  allCharacters: string[];
  selected: string | null;
  onSelect: (character: string | null) => void;
}

export default function CharacterAvatars({ allCharacters, selected, onSelect }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [closing, setClosing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (expanded && scrollRef.current) {
      scrollRef.current.scrollLeft = 0;
    }
  }, [expanded]);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      setExpanded(false);
    }, 260);
  };

  const pinnedChars = ['Tony Soprano', 'Christopher Moltisanti', 'Uncle Junior'].filter(p =>
    allCharacters.includes(p)
  );
  const otherChars = allCharacters.filter(c => !pinnedChars.includes(c));

  const handleSelect = (char: string) => {
    onSelect(selected === char ? null : char);
  };

  const stackChars =
    selected && !pinnedChars.includes(selected)
      ? [selected, ...pinnedChars]
      : pinnedChars;

  if (expanded || closing) {
    const sorted = [...allCharacters].sort((a, b) => {
      if (a === selected) return -1;
      if (b === selected) return 1;
      return 0;
    });

    return (
      // AFM-152: wrapper isolates the fade overlay from the collapse button
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        <div className="relative flex-1 min-w-0">
          {/* Scrollable avatar row */}
          <div
            ref={scrollRef}
            className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5"
          >
            {sorted.map((char, i) => (
              <div
                key={char}
                style={{
                  animation: closing
                    ? `avatarCollapseOut 0.16s ease-in forwards`
                    : `avatarExpandIn 0.16s ease-out forwards`,
                  animationDelay: closing
                    ? `${(sorted.length - 1 - i) * 10}ms`
                    : `${i * 10}ms`,
                  opacity: 0,
                  flexShrink: 0,
                }}
              >
                <Avatar
                  name={char}
                  active={selected === char}
                  onClick={() => handleSelect(char)}
                />
              </div>
            ))}
          </div>

          {/* AFM-152: right-edge fade gradient */}
          <div
            className="pointer-events-none absolute right-0 top-0 h-full w-10"
            style={{ background: 'linear-gradient(to left, #1C1C1C, transparent)' }}
          />
        </div>

        {/* Collapse button — outside the faded scroll area */}
        <button
          onClick={handleClose}
          className="flex-shrink-0 w-9 h-9 rounded-full bg-[#2a2a2a] text-[#666] text-xs flex items-center justify-center hover:text-white transition-colors ring-1 ring-white/10"
          style={{
            animation: closing
              ? `avatarCollapseOut 0.16s ease-in forwards`
              : `avatarExpandIn 0.16s ease-out forwards`,
            animationDelay: closing ? '0ms' : `${sorted.length * 10}ms`,
            opacity: 0,
          }}
        >
          ✕
        </button>
      </div>
    );
  }

  // Stacked view
  // AFM-151: pl-0.5 gives the first avatar's active ring room on the left
  // AFM-153: explicit flex + items-center on +N wrapper prevents vertical drift
  return (
    <div className="flex items-center pl-0.5">
      {stackChars.map((char, i) => (
        <div
          key={char}
          className="transition-all duration-300"
          style={{
            marginLeft: i === 0 ? 0 : -10,
            zIndex: selected === char ? 10 : stackChars.length - i,
            position: 'relative',
          }}
        >
          <Avatar name={char} active={selected === char} onClick={() => handleSelect(char)} />
        </div>
      ))}

      {/* +N expand button — no wrapper div, styles applied directly to avoid height drift */}
      <button
        onClick={() => setExpanded(true)}
        className="flex items-center justify-center rounded-full bg-[#2a2a2a] text-[#888] text-[11px] font-medium ring-1 ring-white/10 hover:text-white transition-colors flex-shrink-0"
        style={{ width: AVATAR_SIZE, height: AVATAR_SIZE, marginLeft: -10, zIndex: 0, position: 'relative' }}
      >
        +{otherChars.length}
      </button>
    </div>
  );
}
