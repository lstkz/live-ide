import tmp from 'tmp';
import Path from 'path';
import fs from 'fs';
import { writeFileMap } from './helper';
import { TypesBundler } from '../src/TypesBundler';

let dir: tmp.DirResult = null!;
let baseSourceDir: string = null!;
let bundler: TypesBundler = null!;

beforeEach(() => {
  dir = tmp.dirSync();
  const targetPath = Path.join(dir.name, 'node_modules');
  fs.mkdirSync(targetPath, { recursive: true });
  baseSourceDir = targetPath;
  bundler = new TypesBundler(targetPath);
});

afterEach(() => {
  dir.removeCallback();
});

async function _getOutput() {
  const bundles = await bundler.extractBundles();
  return bundles.map(bundle => ({
    name: bundle.name,
    bundle: JSON.parse(fs.readFileSync(bundle.bundle, 'utf8')),
  }));
}

it('should bundle a single type', async () => {
  writeFileMap(baseSourceDir, {
    'react/package.json': {
      name: 'react',
      version: '1.0.0',
    },
    'react/index.d.ts': `
      export const foo = 1;
      `,
  });
  expect(await _getOutput()).toMatchInlineSnapshot(`
Array [
  Object {
    "bundle": Object {
      "index.d.ts": "
      export const foo = 1;
      ",
    },
    "name": "react",
  },
]
`);
});

it('should be empty if no types', async () => {
  writeFileMap(baseSourceDir, {
    'react/package.json': {
      name: 'react',
      version: '1.0.0',
    },
    'react/index.js': `
      export const foo = 1;
      `,
  });
  expect(await _getOutput()).toMatchInlineSnapshot(`Array []`);
});

it('should should create custom index.d.ts from package.json', async () => {
  writeFileMap(baseSourceDir, {
    'react/package.json': {
      name: 'react',
      version: '1.0.0',
      types: 'dist/types.ds.ts',
    },
    'react/dist/types.d.ts': `
      export const foo = 1;
      `,
  });
  expect(await _getOutput()).toMatchInlineSnapshot(`
Array [
  Object {
    "bundle": Object {
      "dist/types.d.ts": "
      export const foo = 1;
      ",
      "index.d.ts": "export * from './dist/types.ds.ts';
",
    },
    "name": "react",
  },
]
`);
});

it('should should create custom index.d.ts from package.json and guess typings', async () => {
  writeFileMap(baseSourceDir, {
    'react/package.json': {
      name: 'react',
      version: '1.0.0',
      module: 'dist/index.js',
    },
    'react/dist/index.d.ts': `
      export const foo = 1;
      `,
  });
  expect(await _getOutput()).toMatchInlineSnapshot(`
Array [
  Object {
    "bundle": Object {
      "dist/index.d.ts": "
      export const foo = 1;
      ",
      "index.d.ts": "export * from './dist/index';
",
    },
    "name": "react",
  },
]
`);
});
