
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {

  server: {
    url: 'https://solourahealth.netlify.app/dashboard', // URL of your Next.js app during development
    // url: 'http://192.168.18.150:3000', // URL of your Next.js app during development
    cleartext: true, // Allow cleartext traffic for development
  },
  ios: {
    contentInset: 'always', // Adjusts the content inset for iOS
    allowsLinkPreview: true, // Allows link previews in iOS
  },
  appId: 'com.soloura.app',
  appName: 'Soloura',
  webDir: 'out',
  bundledWebRuntime: false,
};

export default config;
