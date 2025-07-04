import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageTitleProps {
  children: ReactNode;
  className?: string;
}

export function PageTitle({ children, className }: PageTitleProps) {
  return (
    <h1 className={cn('text-2xl sm:text-3xl font-headline font-bold text-primary mb-6', className)}>
      {children}
    </h1>
  );
}
