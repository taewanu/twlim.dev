import type { Metadata, Viewport } from 'next';
import { Source_Sans_3, Lora } from 'next/font/google';

import './globals.css';

const sourceSans = Source_Sans_3({
  variable: '--font-source-sans',
  subsets: ['latin'],
});

const lora = Lora({
  variable: '--font-lora',
  subsets: ['latin'],
  weight: ['400', '700'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://twlim.dev'),
  title: 'Taewan Lim',
  description: 'Software Developer',
};

// Mirrors --color-bg in globals.css, since a meta tag can't read a CSS variable.
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fdfdfc' },
    { media: '(prefers-color-scheme: dark)', color: '#1b1917' },
  ],
};

export function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sourceSans.variable} ${lora.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}

export default RootLayout;
