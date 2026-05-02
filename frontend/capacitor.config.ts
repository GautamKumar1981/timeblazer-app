import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dragonhour.app',
  appName: 'DragonHour',
  webDir: 'build',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    // Remove the line below (or set a real URL) once backend is deployed.
    // url: 'http://YOUR_DEPLOYED_BACKEND_IP:5000',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2500,
      backgroundColor: '#0f0e1a',
      androidSplashResourceName: 'splash',
      showSpinner: false,
      launchAutoHide: true,
    },
    StatusBar: {
      style: 'Dark',
      backgroundColor: '#0f0e1a',
    },
  },
  android: {
    // Allows cleartext (http) traffic during local development only.
    // Remove / set to false for production.
    allowMixedContent: true,
  },
};

export default config;
