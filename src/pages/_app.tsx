// src/pages/_app.tsx
import type { AppProps } from 'next/app';
import { AppNavbar } from '@/components/layout/AppNavbar';
import { PageContainer } from '@/components/shared/PageContainer';
import '../app/globals.css';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useEffect } from 'react';


function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Only run if Capacitor is available
    if (typeof window !== 'undefined' && (window as any).Capacitor) {
      import('@capacitor/status-bar').then(({ StatusBar, Style }) => {
        StatusBar.setBackgroundColor({ color: '#ffffff' });
        StatusBar.setStyle({ style: Style.Light });
      });
    }
  }, []);
  return (
    <div className="flex flex-col">
      <AuthGuard>
        <AppNavbar />
      </AuthGuard>
      <main className="flex-grow my-10 p-8 ">
        <PageContainer>
          <Component {...pageProps} />
        </PageContainer>
      </main>
      <footer className="py-4 text-center text-sm text-muted-foreground border-t border-border">
        © {new Date().getFullYear()} Soloura. Nurturing your mental wellbeing.
      </footer>
    </div>
  );
}

export default MyApp;
