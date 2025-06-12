export default {
  expo: {
    name: "lynk",
    slug: "lynk",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    scheme: "lynk",
    userInterfaceStyle: "automatic",
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.lynk.app"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      package: "com.lynk.app",
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    extra: {
      supabaseUrl: "https://jpirmkxxnzycatxgphel.supabase.co",
      supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwaXJta3h4bnp5Y2F0eGdwaGVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNDk0MzcsImV4cCI6MjA2MjYyNTQzN30.y-kpjqj8SLr1QENHyVq85NgJ-m4zApaOPwrOOi-Rwb0",
      eas: {
        projectId: "jpirmkxxnzycatxgphel",
      },
    },
    plugins: [
      "expo-router"
    ]
  }
};