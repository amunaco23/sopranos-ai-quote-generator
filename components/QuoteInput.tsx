'use client';

import { useState, useCallback, useEffect, useRef, KeyboardEvent } from 'react';
import CharacterAvatars from './CharacterAvatars';

function SubmitArrow() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="20" fill="white" />
      <path d="M13 20h14M21.5 13.5L28 20l-6.5 6.5" stroke="#0D0D0D" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SubmitSpinner() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-spin">
      <circle cx="20" cy="20" r="17" stroke="#333333" strokeWidth="2.5" />
      <path d="M20 3a17 17 0 0 1 17 17" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

// Dismissible onboarding hint — hidden forever after "Got it"
function OnboardingHint() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('hint-dismissed')) {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem('hint-dismissed', '1');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="flex items-center justify-between gap-3 mb-3 px-4 py-2.5 rounded-xl bg-[#1C1C1C] border border-white/5">
      <p className="text-sm text-[#666] leading-snug">
        <span className="text-[#999]">Paste anything.</span>{' '}
        Drop in a topic, mood, situation, or sentence — we'll find the quote.
      </p>
      <button
        onClick={dismiss}
        className="flex-shrink-0 text-xs text-[#444] hover:text-white transition-colors px-2 py-1 rounded-md hover:bg-white/5"
      >
        Got it
      </button>
    </div>
  );
}

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

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      textareaRef.current?.focus();
    }
  }, []);

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();

    if (!trimmed) {
      if (selectedCharacter) {
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
      {/* Onboarding hint */}
      <OnboardingHint />

      {/* Input card */}
      <div
        className={[
          'bg-[#1C1C1C] rounded-2xl px-4 pt-4 pb-3',
          shake ? 'animate-shake' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        style={{ overflow: 'visible' }}
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
            className="flex-shrink-0 ml-3 disabled:cursor-not-allowed transition-opacity active:scale-95"
          >
            {disabled ? <SubmitSpinner /> : <SubmitArrow />}
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
          <span className="text-xs" style={{ lineHeight: 1, transform: 'translateY(-1px)', display: 'inline-block' }}>✦</span>
          Surprise Me
        </button>
      </div>
    </div>
  );
}
