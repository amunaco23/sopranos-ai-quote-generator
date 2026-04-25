'use client';

import { useState, useEffect } from 'react';

interface Props {
  message: string;
  retryAfter: number;
  onDismiss: () => void;
}

export default function RateLimitToast({ message, retryAfter, onDismiss }: Props) {
  const [seconds, setSeconds] = useState(retryAfter);

  useEffect(() => {
    const dismiss = setTimeout(onDismiss, 5000);
    return () => clearTimeout(dismiss);
  }, [onDismiss]);

  useEffect(() => {
    if (seconds <= 0) return;
    const tick = setTimeout(() => setSeconds(s => s - 1), 1000);
    return () => clearTimeout(tick);
  }, [seconds]);

  return (
    <div className="fixed top-4 right-4 max-w-xs bg-[#1A1A1A] border border-[#C41E1E] rounded-lg p-4 shadow-xl z-50 animate-slide-in">
      <p className="text-white text-sm leading-snug">{message}</p>
      {seconds > 0 && (
        <p className="text-[#C41E1E] text-xs mt-2 font-medium">Retry in {seconds}s</p>
      )}
    </div>
  );
}
