import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "TradeStock Marketplace - Ireland's Premier B2B Motor Trading Platform",
  description:
    "Connect with verified motor dealers across all 32 counties of Ireland. Buy and sell vehicles wholesale with confidence on TradeStock Marketplace.",
  keywords: [
    "motor trading",
    "car dealership",
    "Ireland",
    "wholesale vehicles",
    "B2B marketplace",
    "car sales",
  ],
  authors: [{ name: "TradeStock Marketplace" }],
  openGraph: {
    title: "TradeStock Marketplace",
    description: "Ireland's Premier B2B Motor Trading Platform",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster 
          position="top-right" 
          richColors 
          closeButton
          toastOptions={{
            style: {
              fontFamily: "var(--font-sans)",
            },
          }}
        />
      </body>
    </html>
  );
}
