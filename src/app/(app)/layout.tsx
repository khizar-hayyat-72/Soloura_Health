
// src/app/(app)/layout.tsx
"use client";

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { AppNavbar } from '@/components/layout/AppNavbar';
import { PageContainer } from '@/components/shared/PageContainer';
import { Skeleton } from '@/components/ui/skeleton';


export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="bg-card shadow-md sticky top-0 z-50 pt-[env(safe-area-inset-top)]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Skeleton className="h-8 w-32" />
              <div className="flex items-center space-x-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </div>
          </div>
        </header>
        <PageContainer className="flex-grow">
          <Skeleton className="h-12 w-1/2 mb-6" />
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppNavbar />
      <main className="flex-grow">
        {children}
      </main>
      <footer className="py-4 text-center text-sm text-muted-foreground border-t border-border pb-[calc(1rem+env(safe-area-inset-bottom))]">
        © {new Date().getFullYear()} Soloura. Nurturing your mental wellbeing.
      </footer>
    </div>
  );
}
