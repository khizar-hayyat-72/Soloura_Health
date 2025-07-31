
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.soloura.app',
  appName: 'Soloura',
  webDir: 'out', // Points to the static export directory
  bundledWebRuntime: false,
  plugins: {
    StatusBar: {
      overlay: false
    }
  }
};

export default config;
