// Use CommonJS for better compatibility
const { getDefaultConfig } = require('@expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

// Add support for Firebase JS SDK
defaultConfig.resolver.sourceExts = [...defaultConfig.resolver.sourceExts, 'mjs', 'cjs'];
defaultConfig.resolver.assetExts = [...defaultConfig.resolver.assetExts, 'firebase'];

// Add support for directory imports
defaultConfig.resolver.resolverMainFields = ['browser', 'main', 'module'];

defaultConfig.transformer = {
  ...defaultConfig.transformer,
  unstable_allowRequireContext: true,
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
};

defaultConfig.resolver.nodeModulesPaths = [
  ...defaultConfig.resolver.nodeModulesPaths,
  './node_modules',
];

// Export as CommonJS module
module.exports = defaultConfig;
