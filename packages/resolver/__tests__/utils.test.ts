import {
  extractLibName,
  removePackageVersion,
  splitVersion,
} from '../src/utils';

describe('removePackageVersion', () => {
  it.each([
    ['react', 'react'],
    ['react@1.2.3', 'react'],
    ['@types/react', '@types/react'],
    ['@types/react@1.2.3', '@types/react'],
  ])('%j', (input, expected) => {
    expect(removePackageVersion(input)).toEqual(expected);
  });
});

describe('splitVersion', () => {
  it.each([
    ['react', { name: 'react', version: '*' }],
    ['react@1.2.3', { name: 'react', version: '1.2.3' }],
    ['@types/react', { name: '@types/react', version: '*' }],
    ['@types/react@1.2.3', { name: '@types/react', version: '1.2.3' }],
  ])('%j', (input, expected) => {
    expect(splitVersion(input)).toEqual(expected);
  });
});

describe('extractLibName', () => {
  it.each([
    ['react', 'react'],
    ['react/index.js', 'react'],
    ['a/b/c/node_modules/react/index.js', 'react'],
    ['a/b/c/node_modules/@types/react/index.js', '@types/react'],
  ])('%j', (input, expected) => {
    expect(extractLibName(input)).toEqual(expected);
  });
});
