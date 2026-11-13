import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.klarinetos.deadbeefsharp',
  appName: 'DEADBEEF♯',
  webDir: 'dist',
  plugins: {
    SystemBars: {
      // The page uses viewport-fit=cover and pads itself with env(safe-area-inset-*).
      insetsHandling: 'native',
      initialViewportFitValueHint: 'cover',
    },
  },
};

export default config;
