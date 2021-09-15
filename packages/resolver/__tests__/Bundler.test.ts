import tmp from 'tmp';
import fs from 'fs';
import { Bundler } from '../src/Bundler';
import { writeFileMap } from './helper';

let dir: tmp.DirResult = null!;
let baseSourceDir: string = null!;
let bundler: Bundler = null!;

beforeEach(() => {
  dir = tmp.dirSync();
  baseSourceDir = dir.name;
  bundler = new Bundler(dir.name);
});

afterEach(() => {
  dir.removeCallback();
});

it('should bundle a single dependency', async () => {
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
  const path = await bundler.bundle('react');
  expect(fs.readFileSync(path, 'utf8')).toMatchInlineSnapshot(`
"const foo = 1;

export { foo };
"
`);
});

it('should bundle a single dependency with relative paths', async () => {
  writeFileMap(baseSourceDir, {
    'react/package.json': {
      name: 'react',
      version: '1.0.0',
      module: 'index.esm.js',
    },
    'react/index.esm.js': `
      import {foo} from './foo'
      export const foo2 = foo + 1;
      `,
    'react/foo.js': `
      export const foo = 1;
      `,
  });
  const path = await bundler.bundle('react');
  expect(fs.readFileSync(path, 'utf8')).toMatchInlineSnapshot(`
"const foo = 1;

const foo2 = foo + 1;

export { foo2 };
"
`);
});

it('should bundle a single dependency with external dependencies', async () => {
  writeFileMap(baseSourceDir, {
    'react/package.json': {
      name: 'react',
      version: '1.0.0',
      module: 'index.esm.js',
    },
    'react/index.esm.js': `
    import {bar} from 'bar';

      export const foo = bar + 1;
      `,
  });
  const path = await bundler.bundle('react');
  expect(fs.readFileSync(path, 'utf8')).toMatchInlineSnapshot(`
"import { bar } from 'bar';

const foo = bar + 1;

export { foo };
"
`);
});
