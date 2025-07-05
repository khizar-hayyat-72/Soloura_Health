
import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <main className="w-full max-w-md">
        {children}
      </main>
      <footer className="py-4 mt-8 text-center text-sm text-muted-foreground pb-[calc(1rem+env(safe-area-inset-bottom))]">
         Soloura - Your journey to inner peace starts here.
      </footer>
    </div>
  );
}
