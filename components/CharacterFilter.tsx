'use client';

import { useState } from 'react';

const PINNED = ['Tony Soprano', 'Junior Soprano', 'Christopher Moltisanti'];
const MAX_SELECTED = 3;

interface Props {
  allCharacters: string[];
  selected: string[];
  onToggle: (character: string) => void;
  onClear: () => void;
}

function Pill({
  label,
  active,
  disabled,
  onClick,
}: {
  label: string;
  active: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        'px-3 py-1 rounded-full text-xs font-medium border transition-all duration-150 whitespace-nowrap',
        active
          ? 'bg-[#C41E1E] border-[#C41E1E] text-white'
          : disabled
          ? 'bg-transparent border-[#2a2a2a] text-[#3a3a3a] cursor-not-allowed'
          : 'bg-transparent border-[#444444] text-[#A0A0A0] hover:border-[#C41E1E] hover:text-white',
      ].join(' ')}
    >
      {label}
    </button>
  );
}

export default function CharacterFilter({ allCharacters, selected, onToggle, onClear }: Props) {
  const [showAll, setShowAll] = useState(false);

  const others = allCharacters.filter(c => !PINNED.includes(c));
  const visible = showAll ? [...PINNED, ...others] : PINNED;

  return (
    <div className="mt-3">
      <div className="flex flex-wrap gap-2 items-center">
        {visible.map(char => (
          <Pill
            key={char}
            label={char}
            active={selected.includes(char)}
            disabled={selected.length >= MAX_SELECTED && !selected.includes(char)}
            onClick={() => onToggle(char)}
          />
        ))}

        {!showAll && others.length > 0 && (
          <button
            onClick={() => setShowAll(true)}
            className="px-3 py-1 rounded-full text-xs font-medium border border-dashed border-[#444444] text-[#555555] hover:border-[#666666] hover:text-[#888888] transition-all duration-150 whitespace-nowrap"
          >
            +{others.length} more
          </button>
        )}

        {selected.length > 0 && (
          <button
            onClick={onClear}
            className="ml-1 flex items-center gap-1 text-xs text-[#555555] hover:text-[#C41E1E] transition-colors duration-150"
          >
            <span className="text-base leading-none">×</span> Clear
          </button>
        )}
      </div>

      {selected.length === MAX_SELECTED && (
        <p className="text-[#444444] text-xs mt-2">Max 3 characters selected</p>
      )}
    </div>
  );
}
