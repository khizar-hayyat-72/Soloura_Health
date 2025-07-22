
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  server: {
    // url: 'https://solourahealth.netlify.app/login', // URL of your Next.js app during development
    url: 'http://192.168.100.107:3000', // URL of your Next.js app during development
    cleartext: true, // Allow cleartext traffic for development
  },
  ios: {
    contentInset: 'always', 
    preferredContentMode: 'mobile',
    // Adjusts the content inset for iOS
    allowsLinkPreview: true, // Allows link previews in iOS
  },
  appId: 'com.soloura.app',
  appName: 'Soloura',
  webDir: 'out', // Points to the static export directory
  bundledWebRuntime: false,
};

export default config;
