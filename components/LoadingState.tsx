'use client';

import { useState, useEffect } from 'react';

const MESSAGES = [
  "Tony's thinking...",
  'Consulting the family...',
  'Checking with the crew...',
  'Asking around...',
  'Hold your horses...',
];

export default function LoadingState() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex(i => (i + 1) % MESSAGES.length);
        setVisible(true);
      }, 300);
    }, 2200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-6 flex items-center justify-center py-12">
      <p
        className={`text-[#555555] text-sm italic tracking-wide transition-opacity duration-300 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {MESSAGES[index]}
      </p>
    </div>
  );
}
