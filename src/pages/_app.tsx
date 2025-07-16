import type { AppProps } from 'next/app';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className="safe-area">
      <Component {...pageProps} />
      <Toaster />
    </div>
  );
}
