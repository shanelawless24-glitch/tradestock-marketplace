// TradeStock Marketplace - Logo Component
// ============================================

import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className, showText = true }: LogoProps) {
  return (
    <Link href="/" className={cn('flex items-center gap-2', className)}>
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-10 w-10"
      >
        <rect width="40" height="40" rx="8" fill="hsl(var(--primary))" />
        <path
          d="M10 25C10 25 12 20 20 20C28 20 30 25 30 25"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="14" cy="26" r="3" fill="white" />
        <circle cx="26" cy="26" r="3" fill="white" />
        <path
          d="M8 18L12 12H28L32 18"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {showText && (
        <span className="text-xl font-bold tracking-tight">
          Trade<span className="text-primary">Stock</span>
        </span>
      )}
    </Link>
  );
}
