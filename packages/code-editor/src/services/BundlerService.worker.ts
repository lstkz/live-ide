import * as Babel from '@babel/standalone';
import Path from 'path';
import replace from '@rollup/plugin-replace';
import commonjs from '@rollup/plugin-commonjs';
import transformCommonjs from 'babel-plugin-transform-commonjs';

import { OutputAsset, OutputChunk, RenderedModule, rollup } from 'rollup';
import { BundlerAction, BundlerCallbackAction, SourceCode } from '../types';

declare const self: Worker;

function sendMessage(action: BundlerCallbackAction) {
  self.postMessage(action);
}

interface BuildSourceCodeOptions {
  input: string;
  modules: Record<string, SourceCode>;
  libraryUrl: string;
}

function _getRelativePath(target: string, parent: string) {
  const target_split = target.split('/');
  const parent_split = parent.split('/');
  parent_split.pop();
  while (target_split[0] === '..') {
    target_split.shift();
    parent_split.pop();
  }
  if (parent_split[0]) {
    parent_split.shift();
  }
  const base = [...parent_split, ...target_split].filter(x => x !== '.');
  return ['.', ...base].join('/');
}

const libraryCache: Record<string, Promise<Record<string, string>>> = {};

async function buildSourceCode(options: BuildSourceCodeOptions) {
  const { input, modules, libraryUrl } = options;
  if (!libraryCache[libraryUrl]) {
    libraryCache[libraryUrl] = fetch(libraryUrl).then(x => x.json());
  }
  const library = await libraryCache[libraryUrl];

  const extensions = ['.ts', '.tsx', '.js', '.jsx'];
  const styles: Record<string, string> = {};
  return rollup({
    input,
    plugins: [
      {
        name: 'import-css',
        transform(code, id) {
          if (!id.endsWith('.css')) {
            return;
          }
          styles[id] = code;
          return {
            code: `export default ${JSON.stringify(code)};`,
            map: { mappings: '' },
          };
        },
        generateBundle(opts, bundle) {
          const modules: Record<string, RenderedModule> = {};
          for (const file in bundle) {
            const data = bundle[file];
            if ('modules' in data) {
              Object.assign(modules, data.modules);
            }
          }
          const css = Object.keys(styles)
            .filter(id => !modules[id])
            .map(id => styles[id])
            .join('\n');
          if (css.trim().length <= 0) {
            return;
          }
          this.emitFile({
            type: 'asset',
            fileName: `styles.css`,
            source: css,
          });
        },
      },
      replace({
        preventAssignment: true,
        values: {
          'process.env.NODE_ENV': JSON.stringify('development'),
        },
      }),
      {
        name: 'test',
        resolveId(target, parent) {
          if (target[0] !== '.') {
            const file = library[target];
            if (file) {
              return target;
            }
            const pkgPlain = library[file + '/package.json'];
            if (pkgPlain) {
              const pkg = JSON.parse(pkgPlain);
              if (!pkg.main) {
                throw new Error('main entry missing for ' + file);
              }
              return Path.join(target, pkg.main);
            }
            const indexPath = target + '/index.js';
            const indexFile = library[indexPath];
            if (indexFile) {
              return indexPath;
            }
            throw new Error('Cannot resolve ' + target);
          }
          let path = _getRelativePath(target, parent ?? '');
          for (const ext of extensions) {
            if (modules[path + ext]) {
              path += ext;
              break;
            }
          }
          return path;
        },
        load: function (id) {
          if (library[id]) {
            return library[id];
          }
          if (!modules[id]) {
            throw new Error('Module not found: ' + id);
          }
          return modules[id].code;
        },
        transform(code, filename) {
          const presets: any = [];
          if (/\.(t|j)sx/.test(filename)) {
            presets.push(Babel.availablePresets.react);
          }
          if (/\.tsx?/.test(filename)) {
            presets.push(Babel.availablePresets.typescript);
          }
          return Babel.transform(code, {
            filename,
            presets,
            plugins: [transformCommonjs()],
          }) as any;
        },
      },
    ],
  });
}

self.addEventListener('message', async event => {
  const action = event.data as BundlerAction;
  const { input, version, modules, libraryUrl } = action.payload;

  try {
    const build = await buildSourceCode({ input, modules, libraryUrl });
    const { output } = await build.generate({
      sourcemap: 'inline',
      inlineDynamicImports: true,
      format: 'es',
    });
    const chunks = output.filter(x => x.type === 'chunk') as OutputChunk[];
    const assets = output.filter(x => x.type === 'asset') as OutputAsset[];
    if (chunks.length !== 1) {
      throw new Error('Expected single chunk, got: ' + chunks.length);
    }
    const code =
      chunks[0].code + '\n//# sourceMappingURL=' + chunks[0].map!.toUrl();
    const css = assets[0]?.source as string;
    sendMessage({
      type: 'bundled',
      payload: {
        code,
        version,
        css,
      },
    });
  } catch (e: any) {
    console.error('bundler error', e);
    sendMessage({
      type: 'error',
      payload: {
        error: e,
        version,
      },
    });
  }
});

export {};
