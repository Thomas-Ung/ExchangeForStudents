const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add specific resolver options for problematic packages
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  // Handle specific modules that need special treatment
  'openai': require.resolve('openai')
};

// Modify to properly handle the issue
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

module.exports = config;