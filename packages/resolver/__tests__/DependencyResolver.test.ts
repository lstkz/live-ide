import tmp from 'tmp';
import { DependencyResolver } from '../src/DependencyResolver';
import { writeFileMap } from './helper';

let dir: tmp.DirResult = null!;
let baseSourceDir: string = null!;
let resolver: DependencyResolver = null!;

beforeEach(() => {
  dir = tmp.dirSync();
  baseSourceDir = dir.name;
  resolver = new DependencyResolver(dir.name);
});

afterEach(() => {
  dir.removeCallback();
});

it('should resolve a single dependency', async () => {
  writeFileMap(baseSourceDir, {
    'react/package.json': {
      name: 'react',
      version: '1.0.0',
      module: 'index.esm.js',
    },
    'react/index.esm.js': `
      export const foo = 1;
      `,
  });
  await resolver.resolve(['react']);
  expect(resolver.getDeps()).toMatchInlineSnapshot(`
Array [
  "react",
]
`);
});

it('should resolve two dependencies', async () => {
  writeFileMap(baseSourceDir, {
    'react/package.json': {
      name: 'react',
      version: '1.0.0',
      module: 'index.esm.js',
    },
    'react/index.esm.js': `
    import {foo} from 'foo'; 
    export const foo2 = foo + 1;
      `,
    'foo/package.json': {
      name: 'foo',
      version: '1.0.0',
      module: 'sub/index.esm.js',
    },
    'foo/sub/index.esm.js': `
    export const foo = 1;
      `,
  });
  await resolver.resolve(['react']);
  expect(resolver.getDeps()).toMatchInlineSnapshot(`
Array [
  "react",
  "foo",
]
`);
});
