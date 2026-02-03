import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';
import './global.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Jobly Web',
  description: 'Jobly web frontend',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans text-foreground antialiased',
          inter.variable
        )}
      >
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
