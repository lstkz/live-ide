import * as Babel from '@babel/standalone';
import { OutputAsset, OutputChunk, RenderedModule, rollup } from 'rollup';
import { BundlerAction, BundlerCallbackAction, SourceCode } from '../types';

declare const self: Worker;

function sendMessage(action: BundlerCallbackAction) {
  self.postMessage(action);
}

interface BuildSourceCodeOptions {
  input: string;
  modules: Record<string, SourceCode>;
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

async function buildSourceCode(options: BuildSourceCodeOptions) {
  const { input, modules } = options;

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
      {
        name: 'test',
        resolveId(target, parent) {
          if (target[0] !== '.') {
            return false;
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
          }) as any;
        },
      },
    ],
  });
}

self.addEventListener('message', async event => {
  const action = event.data as BundlerAction;
  const { input, version, modules } = action.payload;

  try {
    const build = await buildSourceCode({ input, modules });
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
