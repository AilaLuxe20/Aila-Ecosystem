/**
 * Android packaging prep for the LIVE production web app (https://ailaluxe.com).
 * Capacitor loads the same production origin — do not duplicate backend or product logic.
 * iOS native project is intentionally not added yet.
 *
 * When ready:
 *   npm i -D @capacitor/cli @capacitor/core
 *   npm i @capacitor/android
 *   npx cap add android
 *   npx cap sync android
 */
const config = {
  appId: "com.ailaluxe.app",
  appName: "Aila",
  webDir: "public",
  server: {
    url: "https://ailaluxe.com",
    cleartext: false,
    allowNavigation: [
      "ailaluxe.com",
      "*.ailaluxe.com",
      "clerk.aila.website",
      "*.clerk.accounts.dev",
    ],
  },
  android: {
    allowMixedContent: false,
    backgroundColor: "#030303",
  },
  plugins: {
    SplashScreen: {
      backgroundColor: "#030303",
      launchAutoHide: true,
    },
  },
};

export default config;
