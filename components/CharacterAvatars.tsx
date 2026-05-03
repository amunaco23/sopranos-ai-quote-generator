'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { CHARACTER_IMAGES, getInitials } from '@/lib/characterData';

const AVATAR_SIZE = 36;

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
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const [hovered, setHovered] = useState(false);

  const handleMouseEnter = () => {
    if (wrapperRef.current) setAnchorRect(wrapperRef.current.getBoundingClientRect());
    setHovered(true);
  };
  const handleMouseLeave = () => {
    setAnchorRect(null);
    setHovered(false);
  };

  // Compose transform: lift (active) + magnify (hover, dock-style)
  const lift = hovered ? -3 : active ? -1 : 0;
  const scale = hovered ? 1.22 : 1;

  return (
    <>
      {/*
        Ring lives on this outer div (no filter) so CSS filter on the inner
        button cannot clip the box-shadow. The outer div also handles the
        lift transform and depth shadow.
      */}
      <div
        ref={wrapperRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={[
          'rounded-full flex-shrink-0',
          active
            ? 'ring-2 ring-[#C41E1E] ring-offset-1 ring-offset-[#1C1C1C]'
            : 'ring-1 ring-white/10 hover:ring-white/30',
        ].join(' ')}
        style={{
          width: AVATAR_SIZE,
          height: AVATAR_SIZE,
          // NO filter here — filter would clip the box-shadow ring above
          transform: `translateY(${lift}px) scale(${scale})`,
          transformOrigin: 'center bottom',
          transition: 'transform 220ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 200ms ease',
          zIndex: hovered ? 20 : undefined,
          position: hovered ? 'relative' : undefined,
          willChange: 'transform',
        }}
      >
        {/* Button gets the filter + overflow:hidden for circular crop — separated from ring */}
        <button
          onClick={onClick}
          className="w-full h-full rounded-full overflow-hidden focus:outline-none block"
          style={{
            filter: active
              ? 'drop-shadow(0 4px 10px rgba(0,0,0,0.7)) drop-shadow(0 0 6px rgba(196,30,30,0.25))'
              : 'drop-shadow(0 2px 5px rgba(0,0,0,0.5))',
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
      </div>

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
  const [scrolled, setScrolled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (expanded && scrollRef.current) {
      scrollRef.current.scrollLeft = 0;
      setScrolled(false);
    }
  }, [expanded]);

  // Single set of values — close is just open played in reverse.
  const STAGGER_MS = 22;
  const DURATION_MS = 320;
  const EASING = 'cubic-bezier(0.34, 1.45, 0.5, 1)';

  const handleClose = () => {
    setClosing(true);
    // Last item to finish = leftmost avatar at delay (n-1)*stagger + duration
    const maxDelay = Math.max(0, otherChars.length - 1) * STAGGER_MS;
    setTimeout(() => {
      setClosing(false);
      setExpanded(false);
    }, maxDelay + DURATION_MS + 40);
  };

  const pinnedChars = ['Tony Soprano', 'Christopher Moltisanti', 'Uncle Junior'].filter(p =>
    allCharacters.includes(p)
  );
  const otherChars = allCharacters.filter(c => !pinnedChars.includes(c));

  const handleSelect = (char: string) => {
    onSelect(selected === char ? null : char);
  };

  // Always keep pinned order — no jumping to front
  const stackChars = pinnedChars;

  const isOpen = expanded || closing;

  // Close = open run in reverse. Same keyframe, same easing, same duration,
  // same stagger spacing — just animation-direction flipped.
  const direction = closing ? 'reverse' : 'normal';

  return (
    <div className="flex items-center pl-1 flex-1 min-w-0">
      {/* Pinned stack — always outside the scroll container.
          Visible when collapsed OR closing so they snap back immediately on close. */}
      {(!expanded || closing) && stackChars.map((char, i) => (
        <div
          key={char}
          style={{
            marginLeft: i === 0 ? 0 : -10,
            zIndex: selected === char ? 10 : stackChars.length - i,
            position: 'relative',
            flexShrink: 0,
          }}
        >
          <Avatar name={char} active={selected === char} onClick={() => handleSelect(char)} />
        </div>
      ))}

      {/* +N — only when fully collapsed */}
      {!isOpen && (
        <button
          onClick={() => setExpanded(true)}
          className="flex items-center justify-center rounded-full bg-[#2a2a2a] text-[#888] text-[11px] font-medium ring-1 ring-white/10 hover:text-white transition-colors flex-shrink-0"
          style={{ width: AVATAR_SIZE, height: AVATAR_SIZE, marginLeft: -10, zIndex: 0, position: 'relative' }}
        >
          +{otherChars.length}
        </button>
      )}

      {/* Scroll container — visible when open.
          Pinned are inside only when fully expanded (not closing) so they scroll.
          On close they leave instantly (stacked view above takes over). */}
      {isOpen && (
        <>
          <div className="relative flex-1 min-w-0 ml-1.5">
            <div
              ref={scrollRef}
              className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-2 -my-2 pl-1 -ml-1"
              onScroll={e => setScrolled((e.currentTarget.scrollLeft) > 4)}
            >
              {/* Pinned inside scroll only when expanding/expanded — pulled out on close */}
              {!closing && stackChars.map((char) => (
                <div key={char} style={{ flexShrink: 0 }}>
                  <Avatar name={char} active={selected === char} onClick={() => handleSelect(char)} />
                </div>
              ))}

              {/* Additional — fan in/out */}
              {otherChars.map((char, i) => (
                <div
                  key={char}
                  style={{
                    animationName: 'avatarExpandIn',
                    animationDuration: `${DURATION_MS}ms`,
                    animationTimingFunction: EASING,
                    animationDirection: direction,
                    animationFillMode: 'both',
                    animationDelay: closing
                      ? `${(otherChars.length - 1 - i) * STAGGER_MS}ms`
                      : `${i * STAGGER_MS}ms`,
                    flexShrink: 0,
                    willChange: 'transform, opacity',
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

            {/* Left-edge fade — only visible once the user has scrolled right */}
            <div
              className="pointer-events-none absolute"
              style={{
                top: -8,
                bottom: -8,
                left: -4,
                width: 60,
                background: 'linear-gradient(to left, transparent 0%, #1C1C1C 100%)',
                opacity: scrolled ? 1 : 0,
                transition: 'opacity 200ms ease',
              }}
            />

            {/* Right-edge fade — always visible, fades into the X button */}
            <div
              className="pointer-events-none absolute right-0"
              style={{
                top: -8,
                bottom: -8,
                width: 56,
                background: 'linear-gradient(to right, transparent 0%, #1C1C1C 100%)',
              }}
            />
          </div>

          {/* X collapse button — appears last on open, leaves first on close */}
          <button
            onClick={handleClose}
            className="flex-shrink-0 ml-1.5 w-9 h-9 rounded-full bg-[#2a2a2a] text-[#666] text-xs flex items-center justify-center hover:text-white transition-colors ring-1 ring-white/10"
            style={{
              animationName: 'avatarExpandIn',
              animationDuration: `${DURATION_MS}ms`,
              animationTimingFunction: EASING,
              animationDirection: direction,
              animationFillMode: 'both',
              animationDelay: closing
                ? '0ms'
                : `${Math.min(otherChars.length, 8) * STAGGER_MS}ms`,
              willChange: 'transform, opacity',
            }}
          >
            ✕
          </button>
        </>
      )}
    </div>
  );
}
