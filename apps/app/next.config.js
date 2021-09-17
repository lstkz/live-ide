/* eslint-disable no-undef */

const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');
const fs = require('fs');
const withTM = require('next-transpile-modules')([
  'context-api',
  'schema',
  'shared',
  'code-editor', 
]);

function getEnv() {
  const ret = {};
  Object.keys(process.env).forEach(name => {
    if (name.startsWith('LV_PUBLIC_')) {
      ret[name.replace('LV_PUBLIC_', '')] = process.env[name];
    }
  });
  return ret;
}

function getOnigasmPath() {
  const path1 = path.join(__dirname, './node_modules/onigasm/lib/onigasm.wasm');
  const path2 = path.join(
    __dirname,
    '../../node_modules/onigasm/lib/onigasm.wasm'
  );
  if (fs.existsSync(path1)) {
    return path1;
  }
  if (fs.existsSync(path2)) {
    return path2;
  }
  throw new Error('Cannot locale onigasm.wasm');
}

module.exports = withTM({
  assetPrefix: process.env.ASSET_PREFIX,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack5: true,
  env: getEnv(),
  webpack: (config, options) => {
    config.plugins.push(
      new CopyWebpackPlugin({
        patterns: [
          {
            from: getOnigasmPath(),
            to: path.join(__dirname, 'public/onigasm.wasm'),
          },
        ],
      })
    );
    return config;
  },
});
