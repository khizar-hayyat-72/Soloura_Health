
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {

  server: {   
    url: 'http://localhost:3000', // URL for the PWA
    cleartext: true, // Allow HTTP requests if needed
  },
  appId: 'com.soloura.app',
  appName: 'Soloura',
  webDir: 'out', // Points to the static export directory
  plugins: {
    StatusBar: {
      overlay: false
    }
  },
  ios: {
    contentInset: 'always',
    
  }
};

export default config;
