// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for additional file extensions
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs', 'cjs'];

// Configure asset handling
config.resolver.assetExts = [...config.resolver.assetExts, 'db', 'sqlite'];

// Add error handling for module resolution
config.resolver.resolveRequest = (context, moduleName, platform) => {
  try {
    return context.resolveRequest(context, moduleName, platform);
  } catch (error) {
    console.warn(`Failed to resolve module: ${moduleName}`, error);
    return null;
  }
};

module.exports = config; 