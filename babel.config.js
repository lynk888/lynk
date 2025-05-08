module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', {
        unstable_transformImportMeta: true
      }]
    ],
    plugins: [
      ['module-resolver', {
        root: ['.'],
        alias: {
          '@': '.',
          '@components': './components',
          '@screens': './screens',
          '@services': './services',
          '@context': './context',
          '@config': './config',
          '@assets': './assets',
          '@hooks': './hooks',
          '@utils': './utils'
        },
        extensions: [
          '.ios.ts',
          '.android.ts',
          '.ts',
          '.ios.tsx',
          '.android.tsx',
          '.tsx',
          '.jsx',
          '.js',
          '.json',
          '.cjs',
          '.mjs'
        ]
      }],
      // Add support for handling ES modules and CommonJS modules together
      '@babel/plugin-transform-modules-commonjs',
      'react-native-reanimated/plugin'
    ]
  };

