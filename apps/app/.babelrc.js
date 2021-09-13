module.exports = {
  presets: [['next/babel']],
  plugins: [
    'babel-plugin-twin',
    'babel-plugin-macros',
    ['styled-components', { ssr: true }],
  ],
};
