module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transformIgnorePatterns: ['/node_modules/(?!schema)'],
  globals: {
    'ts-jest': {
      diagnostics: false,
    },
  },
};
