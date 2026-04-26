'use client';

import { useState, useCallback, useEffect, useRef, KeyboardEvent } from 'react';
import Image from 'next/image';
import CharacterAvatars from './CharacterAvatars';

interface Props {
  onSubmit: (message: string, character: string | null) => void;
  onSurpriseMe: (character: string | null) => void;
  disabled: boolean;
  allCharacters: string[];
}

export default function QuoteInput({ onSubmit, onSurpriseMe, disabled, allCharacters }: Props) {
  const [value, setValue] = useState('');
  const [shake, setShake] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus on desktop only — don't pop the keyboard on mobile
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      textareaRef.current?.focus();
    }
  }, []);

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();

    if (!trimmed) {
      if (selectedCharacter) {
        // Empty input + character selected → random from that character
        onSurpriseMe(selectedCharacter);
      } else {
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
      return;
    }

    onSubmit(trimmed, selectedCharacter);
    setValue('');
  }, [value, selectedCharacter, onSubmit, onSurpriseMe]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full">
      {/* Input card */}
      <div
        className={[
          'bg-[#1C1C1C] rounded-2xl px-4 pt-4 pb-3',
          shake ? 'animate-shake' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="You talk. We quote."
          rows={3}
          enterKeyHint="send"
          className="w-full bg-transparent text-white placeholder-[#555555] text-[15px] leading-relaxed resize-none focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
        />

        {/* Bottom row: avatars left, submit right */}
        <div className="flex items-center justify-between mt-2">
          <CharacterAvatars
            allCharacters={allCharacters}
            selected={selectedCharacter}
            onSelect={setSelectedCharacter}
          />

          <button
            onClick={handleSubmit}
            disabled={disabled}
            aria-label="Submit"
            className="flex-shrink-0 ml-3 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity active:scale-95"
          >
            <Image
              src="/Submit Icon.png"
              alt="Submit"
              width={40}
              height={40}
              className="w-10 h-10"
            />
          </button>
        </div>
      </div>

      {/* Surprise Me */}
      <div className="flex justify-center mt-4">
        <button
          onClick={() => onSurpriseMe(selectedCharacter)}
          disabled={disabled}
          className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#1C1C1C] text-[#777] text-sm hover:text-white hover:bg-[#242424] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className="text-base leading-none">✦</span>
          Surprise Me
        </button>
      </div>
    </div>
  );
}
