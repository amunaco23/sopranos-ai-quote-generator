import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sopranos Quote Generator',
  description: 'Type a message. Get a Sopranos quote.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#111111" />
      </head>
      <body>{children}</body>
    </html>
  );
}
