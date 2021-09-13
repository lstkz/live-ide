process.env.TS_JEST_DISABLE_VER_CHECKER = '1';

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  watchPathIgnorePatterns: ['<rootDir>/src/generated/'],
  globals: {
    'ts-jest': {
      isolatedModules: true,
      diagnostics: false,
    },
  },
  collectCoverageFrom: [
    './src/**/*.ts', 
    '!src/create-db.ts',
    '!src/types.ts',
    '!src/common/**/*.ts',
    '!src/generated/**/*.ts',
  ],
  transform: {},
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
    [
      'jest-watch-suspend',
      {
        key: 's',
        prompt: 'suspend watch mode',
        'suspend-on-start': true,
      },
    ],
  ],
};
