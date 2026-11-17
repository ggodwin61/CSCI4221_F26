const path = require('node:path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
config.watchFolders = ['client', 'data'].map(folder => path.resolve(__dirname, '..', folder));
config.resolver.nodeModulesPaths = [
  path.join(__dirname, 'node_modules'),
  ...config.resolver.nodeModulesPaths,
];

module.exports = config;
