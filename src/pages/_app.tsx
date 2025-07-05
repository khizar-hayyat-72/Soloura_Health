// src/pages/_app.tsx
import type { AppProps } from 'next/app';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div>
      <Component {...pageProps} />
      <Toaster />
    </div>
  );
}
