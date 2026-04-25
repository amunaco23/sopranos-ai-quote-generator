import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sopranos Quote Generator',
  description: 'Type a message. Get a Sopranos quote.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
