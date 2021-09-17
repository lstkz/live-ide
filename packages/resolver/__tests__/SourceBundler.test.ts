import tmp from 'tmp';
import Path from 'path';
import fs from 'fs';
import { SourceBundler } from '../src/SourceBundler';
import { writeFileMap } from './helper';

let dir: tmp.DirResult = null!;
let baseSourceDir: string = null!;
let bundler: SourceBundler = null!;

beforeEach(() => {
  dir = tmp.dirSync();
  const targetPath = Path.join(dir.name, 'node_modules');
  fs.mkdirSync(targetPath, { recursive: true });
  baseSourceDir = targetPath;
  bundler = new SourceBundler(targetPath);
});

afterEach(() => {
  dir.removeCallback();
});

it('should bundle a single dependency (ESM)', async () => {
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

it('should bundle a single dependency with relative paths (ESM)', async () => {
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

it('should bundle a single dependency with external dependencies (ESM)', async () => {
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

it('should bundle a single dependency (CJS)', async () => {
  writeFileMap(baseSourceDir, {
    'react-random-package/package.json': {
      name: 'react-random-package',
      version: '1.0.0',
      main: 'index.js',
    },
    'react-random-package/index.js': `
      exports.foo = 1;
    `,
  });
  const path = await bundler.bundle('react-random-package');
  expect(fs.readFileSync(path, 'utf8')).toMatchInlineSnapshot(`
"var reactRandomPackage = {};

reactRandomPackage.foo = 1;

const __esmModule = true;
const {
  foo,
} = reactRandomPackage;

export { __esmModule, reactRandomPackage as default, foo };
"
`);
});

it('should bundle a single dependency with relative paths (CJS)', async () => {
  writeFileMap(baseSourceDir, {
    'react/package.json': {
      name: 'react',
      version: '1.0.0',
      main: 'index.js',
    },
    'react/index.js': `
      const {foo} = require('./foo.js');
      exports.foo2 = foo + 1; 
      `,
    'react/foo.js': `
      module.exports = {foo: 1};
      `,
  });
  const path = await bundler.bundle('react');
  expect(fs.readFileSync(path, 'utf8')).toMatchInlineSnapshot(`
"var react = {};

var foo$1 = {foo: 1};

const {foo} = foo$1;
      react.foo2 = foo + 1;

const __esmModule = true;
const {
  foo2,
} = react;

export { __esmModule, react as default, foo2 };
"
`);
});

it('should bundle a single dependency with external dependencies (CJS)', async () => {
  writeFileMap(baseSourceDir, {
    'bar/package.json': {
      name: 'bar',
      version: '1.0.0',
      main: 'index.js',
    },
    'bar/index.js': ` 
      exports.bar = 2;
      `,
    'react/package.json': {
      name: 'react',
      version: '1.0.0',
      main: 'index.js',
    },
    'react/index.js': `
      const {bar} = require('bar');

      exports.foo = bar + 1;
      `,
  });
  const path = await bundler.bundle('react');
  expect(fs.readFileSync(path, 'utf8')).toMatchInlineSnapshot(`
"import require$$0 from 'bar';

var react = {};

const {bar} = require$$0;

      react.foo = bar + 1;

const __esmModule = true;
const {
  foo,
} = react;

export { __esmModule, react as default, foo };
"
`);
});
