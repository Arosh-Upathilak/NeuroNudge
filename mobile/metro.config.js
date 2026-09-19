const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

// Ensure local module is resolvable by Metro
config.resolver.extraNodeModules = {
  'expo-aisee-glasses': path.resolve(projectRoot, 'modules/expo-aisee-glasses'),
};

module.exports = config;
