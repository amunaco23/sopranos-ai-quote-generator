'use client';

import { useState, useCallback, KeyboardEvent } from 'react';

interface Props {
  onSubmit: (message: string) => void;
  disabled: boolean;
  hasCharacterFilter: boolean;
}

export default function QuoteInput({ onSubmit, disabled, hasCharacterFilter }: Props) {
  const [value, setValue] = useState('');
  const [shake, setShake] = useState(false);

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed) {
      if (hasCharacterFilter) {
        // Empty input + character selected → random quotes from that character
        onSubmit('');
      } else {
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
      return;
    }
    onSubmit(trimmed);
    setValue('');
  }, [value, onSubmit, hasCharacterFilter]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="mt-2">
      <textarea
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="What's eatin' you?"
        rows={3}
        suppressHydrationWarning
        className={[
          'w-full bg-[#0D0D0D] text-white placeholder-[#444444]',
          'border border-[#333333] rounded-lg px-4 py-3 text-base',
          'resize-none focus:outline-none focus:border-[#C41E1E]',
          'transition-colors duration-200',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          shake ? 'animate-shake' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      />
      <p className="text-[#333333] text-xs mt-1.5 text-right">Press Enter to send</p>
    </div>
  );
}
