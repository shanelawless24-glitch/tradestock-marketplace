// TradeStock Marketplace - Root Layout
// ============================================

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/shared/theme-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'TradeStock Marketplace - B2B Motor Dealer Platform',
    template: '%s | TradeStock',
  },
  description: 'Ireland\'s premier B2B marketplace for motor dealers. Buy and sell trade stock quickly and securely.',
  keywords: ['motor dealer', 'B2B marketplace', 'trade stock', 'Ireland', 'car dealer', 'vehicle trading'],
  authors: [{ name: 'TradeStock Marketplace' }],
  creator: 'TradeStock Marketplace',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://tradestock.ie'),
  openGraph: {
    type: 'website',
    locale: 'en_IE',
    siteName: 'TradeStock Marketplace',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
