// src/pages/_app.tsx
import type { AppProps } from 'next/app';
import { AppNavbar } from '@/components/layout/AppNavbar';
import { PageContainer } from '@/components/shared/PageContainer';
import '../app/globals.css';
import { AuthGuard } from '@/components/auth/AuthGuard';


function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className="flex flex-col">
      <AuthGuard>
        <AppNavbar />
      </AuthGuard>
      <main className="flex-grow my-10 ">
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
