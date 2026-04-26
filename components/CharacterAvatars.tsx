'use client';

import { useState } from 'react';
import Image from 'next/image';

// Characters with uploaded photos
const CHARACTER_IMAGES: Record<string, string> = {
  'Tony Soprano': '/Tony.png',
  'Christopher Moltisanti': '/Chrissy.png',
  'Junior Soprano': '/Uncle Junior.png',
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

  return (
    <button
      onClick={onClick}
      title={name}
      className={[
        'rounded-full flex-shrink-0 overflow-hidden transition-all duration-200',
        'focus:outline-none',
        active
          ? 'ring-2 ring-[#C41E1E] ring-offset-1 ring-offset-[#1C1C1C]'
          : 'ring-1 ring-white/10 hover:ring-white/30',
      ].join(' ')}
      style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
    >
      {imgSrc ? (
        <Image
          src={imgSrc}
          alt={name}
          width={AVATAR_SIZE}
          height={AVATAR_SIZE}
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
  );
}

interface Props {
  allCharacters: string[];
  selected: string | null;
  onSelect: (character: string | null) => void;
}

export default function CharacterAvatars({ allCharacters, selected, onSelect }: Props) {
  const [expanded, setExpanded] = useState(false);

  const pinnedChars = ['Tony Soprano', 'Christopher Moltisanti', 'Junior Soprano'].filter(p =>
    allCharacters.includes(p)
  );
  const otherChars = allCharacters.filter(c => !pinnedChars.includes(c));

  const handleSelect = (char: string) => {
    onSelect(selected === char ? null : char);
  };

  // In stacked view, if selected is not pinned, push it to front
  const stackChars =
    selected && !pinnedChars.includes(selected)
      ? [selected, ...pinnedChars]
      : pinnedChars;

  if (expanded) {
    // Horizontal scrollable row of all characters, selected first
    const sorted = [...allCharacters].sort((a, b) => {
      if (a === selected) return -1;
      if (b === selected) return 1;
      return 0;
    });

    return (
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5 flex-1 pr-2">
        {sorted.map(char => (
          <Avatar
            key={char}
            name={char}
            active={selected === char}
            onClick={() => handleSelect(char)}
          />
        ))}
        {/* Collapse button */}
        <button
          onClick={() => setExpanded(false)}
          className="flex-shrink-0 w-9 h-9 rounded-full bg-[#2a2a2a] text-[#666] text-xs flex items-center justify-center hover:text-white transition-colors ring-1 ring-white/10"
          title="Collapse"
        >
          ✕
        </button>
      </div>
    );
  }

  // Stacked view
  return (
    <div className="flex items-center">
      {stackChars.map((char, i) => (
        <div
          key={char}
          className="transition-all duration-300"
          style={{
            marginLeft: i === 0 ? 0 : -10,
            zIndex: stackChars.length - i,
            position: 'relative',
          }}
        >
          <Avatar name={char} active={selected === char} onClick={() => handleSelect(char)} />
        </div>
      ))}

      {/* Overflow / expand button */}
      <div style={{ marginLeft: -10, zIndex: 0, position: 'relative' }}>
        <button
          onClick={() => setExpanded(true)}
          className="flex items-center justify-center rounded-full bg-[#2a2a2a] text-[#888] text-[11px] font-medium ring-1 ring-white/10 hover:text-white transition-colors"
          style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
          title={`${otherChars.length} more characters`}
        >
          +{otherChars.length}
        </button>
      </div>
    </div>
  );
}
