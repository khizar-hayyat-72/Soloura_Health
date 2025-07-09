
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  server: {
    url: 'https://solourahealth.netlify.app/login', // URL of your Next.js app during development
    cleartext: true, // Allow cleartext traffic for development
  },
  appId: 'com.soloura.app',
  appName: 'Soloura',
  webDir: 'out', // Points to the static export directory
  bundledWebRuntime: false,
};

export default config;
