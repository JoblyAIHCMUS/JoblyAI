import type { Metadata } from 'next';
import { Inter, Lexend_Deca, Be_Vietnam_Pro } from 'next/font/google';
import type { ReactNode } from 'react';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import './global.css';
import './style.css';
import { cn } from '@/lib/utils';
import { Providers } from './providers';
import ClientLayout from '@/components/layouts/ClientLayout';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const lexendDeca = Lexend_Deca({
  subsets: ['latin'],
  variable: '--family-primary',
  weight: ['400', '500', '600', '700'],
});
const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['latin'],
  variable: '--family-secondary',
  weight: ['400', '500', '600', '700'],
});

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
          inter.variable,
          lexendDeca.variable,
          beVietnamPro.variable
        )}
      >
        <Providers>
          <ClientLayout>{children}</ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
