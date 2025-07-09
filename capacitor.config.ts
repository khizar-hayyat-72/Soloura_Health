
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  server: {
    url: 'http://192.168.18.150:3000', // URL of your Next.js app during development
    cleartext: true, // Allow cleartext traffic for development
  },
  appId: 'com.soloura.app',
  appName: 'Soloura',
  webDir: 'out', // Points to the static export directory
  bundledWebRuntime: false,
};

export default config;
