/* eslint-disable no-console */
import { rollup } from 'rollup';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import resolve from '@rollup/plugin-node-resolve';
import virtual from '@rollup/plugin-virtual';
import fs from 'fs';
import Path from 'path';
import md5 from 'md5';
import { walk } from './helper';

const REMOVE_SCOPE_CHAR = ['@reduxjs/toolkit'];

const DOMAIN = process.env.STAGE
  ? 'https://cdn.styx-dev.com'
  : 'https://cdn.practice.dev';

interface LibOutput {
  name: string;
  source: string;
  types: string;
  typesBundle: string;
}

function _getHash(content: string) {
  return md5(content).substr(0, 10);
}

function _snake2Pascal(input: string) {
  const arr = input.split('-');
  for (let i = 0; i < arr.length; i++) {
    arr[i] = arr[i].slice(0, 1).toUpperCase() + arr[i].slice(1, arr[i].length);
  }
  return arr.join('');
}

function _findPackage(lib: string) {
  let path = Path.join(__dirname, 'node_modules', lib, 'package.json');
  if (!fs.existsSync(path)) {
    path = Path.join(
      __dirname,
      'node_modules',
      extractLibName(lib),
      'package.json'
    );
  }
  if (!fs.existsSync(path)) {
    throw new Error('Cannot find package.json for ' + lib);
  }
  return {
    pkgPath: path,
    pkg: JSON.parse(fs.readFileSync(path, 'utf8')),
  };
}

function _findTypesPackage(lib: string) {
  const targetLib = '@types/' + mapOrgLib(lib);
  const path = Path.join(__dirname, 'node_modules', targetLib, 'package.json');
  if (!fs.existsSync(path)) {
    return;
  }
  return {
    pkgPath: path,
    pkg: JSON.parse(fs.readFileSync(path, 'utf8')),
  };
}

async function findAllDeps(lib: string, deps: Set<string>) {
  if (deps.has(lib)) {
    return;
  }
  deps.add(lib);
  const { pkg } = _findPackage(lib);
  const isModule = Boolean(pkg.module);
  const input = isModule
    ? require.resolve(lib + '/' + pkg.module)
    : require.resolve(lib);
  const newDeps: string[] = [];
  await rollup({
    input: input,
    plugins: [
      {
        name: 'test',
        resolveId(target) {
          if (/\0/.test(target)) {
            return null;
          }
          if (/^[@a-zA-Z0-9]/.test(target)) {
            if (!deps.has(target)) {
              newDeps.push(target);
            }
            return false;
          }
          return null;
        },
      },
      ...(pkg.module ? [] : [resolve(), commonjs()]),
    ],
  });
  await Promise.all(newDeps.map(dep => findAllDeps(dep, deps)));
}

function extractLibName(path: string) {
  const parts = path.includes('/node_modules/')
    ? path.split('/node_modules/')[1].split('/')
    : path.split('/');
  if (parts[0][0] === '@') {
    return parts.slice(0, 2).join('/');
  }
  return parts[0];
}

function _replaceScopeReferences(content: string) {
  REMOVE_SCOPE_CHAR.forEach(scope => {
    content = content.replace(new RegExp(scope, 'g'), scope.substr(1));
  });
  return content;
}

async function bundleLib(lib: string) {
  const split = lib.split('/');
  const start = split[0][0] === '@' ? 2 : 1;
  const targetLib = split.slice(0, start).join('/');
  const rootPkg = require(targetLib + '/package.json');
  let input = '';
  let isModule = false;
  const path = Path.join(__dirname, 'node_modules', lib);
  const directFilePath = path + '.js';
  // handle @babel/runtime files
  if (fs.existsSync(directFilePath)) {
    input = directFilePath;
    const pkgPath = Path.join(Path.dirname(input), 'package.json');
    if (fs.existsSync(pkgPath)) {
      const subPkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      isModule = subPkg.type === 'module';
    }
  } else {
    const pkgPath = Path.join(path, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    isModule = Boolean(pkg.module);
    if (isModule) {
      input = Path.join(path, pkg.module);
    } else {
      input = Path.join(path, pkg.main);
    }
  }
  const build = await rollup({
    input: input,
    plugins: [
      replace({
        preventAssignment: true,
        values: {
          'process.env.NODE_ENV': JSON.stringify('development'),
        },
      }),
      {
        name: 'test',
        resolveId(target) {
          console.log(target);
          if (/^[@a-zA-Z0-9]/.test(target) && extractLibName(target) !== lib) {
            return false;
          }
          return null;
        },
      },
      ...(isModule ? [] : [resolve(), commonjs()]),
    ],
  });
  const { output } = await build.generate({
    // sourcemap: false,
    // inlineDynamicImports: true,
    format: 'es',
    // esModule: true,
    // exports: 'auto',
  });
  const content = _replaceScopeReferences(output[0].code);
  const sourceFilename = `${rootPkg.version}.${_getHash(content)}.js`;
  const fullDir = Path.join(__dirname, 'libs', lib);
  fs.mkdirSync(fullDir, { recursive: true });
  fs.writeFileSync(Path.join(fullDir, sourceFilename), content);
  const libOutput: LibOutput = {
    name: lib,
    source: DOMAIN + '/npm/' + Path.join(lib, sourceFilename),
    types: '',
    typesBundle: '',
  };
  return libOutput;
}

function _ensureSuffix(str: string, suffix: string) {
  if (!str) {
    return null;
  }
  return str.endsWith(suffix) ? str : str + suffix;
}

export function _getEntryTypes(pkg: any) {
  return _ensureSuffix(pkg.types || pkg.typings, '.d.ts');
}

function mapOrgLib(lib: string) {
  if (lib[0] === '@') {
    return lib.substr(1).replace('/', '__');
  }
  return lib;
}

async function fetchTypesBundle(output: LibOutput) {
  const lib = output.name;
  if (!/^(@[a-z0-9_-]+\/[a-z0-9_-]+)|([a-z0-9_-]+)$/.test(lib)) {
    // TODO
    return;
  }
  const { pkg, pkgPath } = _findTypesPackage(lib) || _findPackage(lib);
  const types = _getEntryTypes(pkg);
  if (!types) {
    return;
  }
  const baseDir = Path.dirname(pkgPath);
  const bundle: Record<string, string> = {};
  const files = walk(baseDir).filter(
    x => x.endsWith('.d.ts') || x.endsWith('/package.json')
  );
  files
    .filter(file => file.endsWith('.d.ts'))
    .forEach(file => {
      const relative = Path.relative(baseDir, file);
      const content = fs.readFileSync(file, 'utf8');
      bundle[relative] = _replaceScopeReferences(content);
    });
  files
    .filter(file => file.endsWith('.json'))
    .forEach(file => {
      const subPkg = JSON.parse(fs.readFileSync(file, 'utf8'));
      let entryTypes = _getEntryTypes(subPkg);
      if (!entryTypes) {
        return;
      }
      const newIndexPath = Path.join(Path.dirname(file), 'index.d.ts');
      const relative = Path.relative(baseDir, newIndexPath);
      if (bundle[relative]) {
        return;
      }
      if (!entryTypes.startsWith('.')) {
        entryTypes = './' + entryTypes;
      }
      const content = `export * from '${entryTypes.replace('.d.ts', '')}';\n`;
      bundle[relative] = content;
    });
  const content = JSON.stringify(bundle, null, 2);
  const targetLib = '@types/' + mapOrgLib(lib);
  const sourceFilename = `${pkg.version}.${_getHash(content)}.json`;
  const fullDir = Path.join(__dirname, 'libs', targetLib);
  fs.mkdirSync(fullDir, { recursive: true });
  fs.writeFileSync(Path.join(fullDir, sourceFilename), content);
  output.typesBundle = DOMAIN + '/npm/' + Path.join(targetLib, sourceFilename);
}

async function generate() {
  console.log(await bundleLib('react'));
  return;
  const deps: Set<string> = new Set();
  const baseLibs = [
    '@reduxjs/toolkit',
    '@reduxjs/toolkit/query',
    '@reduxjs/toolkit/query/react',
    'react',
    'react-dom',
    'react-redux',
  ];
  const skipTypes = ['@reduxjs/toolkit/query', '@reduxjs/toolkit/query/react'];
  await Promise.all(baseLibs.map(lib => findAllDeps(lib, deps)));
  const result: LibOutput[] = [];
  await Promise.all(
    [...deps.values()].map(async lib => {
      try {
        const output = await bundleLib(lib);
        if (!skipTypes.includes(lib)) {
          await fetchTypesBundle(output);
        }
        result.push(output);
      } catch (e) {
        console.error('bundle failed for ', lib, e);
        process.exit(1);
      }
    })
  );
  result.forEach(item => {
    if (REMOVE_SCOPE_CHAR.some(x => item.name.startsWith(x))) {
      item.name = item.name.substr(1);
    }
  });
  console.log(JSON.stringify(result, null, 2));
}

void generate();
