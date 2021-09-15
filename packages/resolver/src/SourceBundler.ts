import Path from 'path';
import tmp from 'tmp';
import { rollup } from 'rollup';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import resolve from '@rollup/plugin-node-resolve';
import virtual from '@rollup/plugin-virtual';
import fs from 'fs';
import {
  extractLibName,
  getHash,
  readCommonJsPath,
  snake2Pascal,
} from './utils';

export class SourceBundler {
  private dir: tmp.DirResult;

  constructor(private baseSourceDir: string) {
    this.dir = tmp.dirSync();
  }

  async bundle(lib: string) {
    const split = lib.split('/');
    const start = split[0][0] === '@' ? 2 : 1;
    const targetLib = split.slice(0, start).join('/');
    const rootPkg = JSON.parse(
      fs.readFileSync(
        Path.join(this.baseSourceDir, targetLib, 'package.json'),
        'utf8'
      )
    );
    const path = Path.join(this.baseSourceDir, lib);
    const directFilePath = path + '.js';
    let input = '';
    let isModule = false;
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
        input = 'index.js';
      }
    }
    const pascalName = snake2Pascal(lib) + '$$$';
    const libPath = Path.join(this.baseSourceDir, lib);
    const getVirtual = () => {
      const content = readCommonJsPath(libPath);
      const reg = /exports\.(\w+) = /g;
      const keys = new Set<string>();
      let m: RegExpExecArray | null = null;
      while ((m = reg.exec(content))) {
        keys.add(m[1]);
      }
      // very hacky solution
      return virtual({
        'index.js': `import ${pascalName} from '${libPath}';

export default ${pascalName};
export const __esmModule = true;
export const {
${[...keys.values()].map(x => `  ${x},`).join('\n')}
} = ${pascalName};
`,
      }) as any;
    };
    const build = await rollup({
      input: input,
      plugins: [
        ...(isModule ? [] : [getVirtual()]),
        replace({
          preventAssignment: true,
          values: {
            'process.env.NODE_ENV': JSON.stringify('development'),
          },
        }),
        {
          name: 'skip-external',
          resolveId(target) {
            if (
              /^[@a-zA-Z0-9]/.test(target) &&
              extractLibName(target) !== lib
            ) {
              return false;
            }
            return null;
          },
        },
        ...(isModule ? [] : [resolve(), commonjs()]),
      ],
    });
    const { output } = await build.generate({
      sourcemap: false,
      inlineDynamicImports: true,
      format: 'es',
      exports: 'named',
    });
    const content = output[0].code;
    const sourceFilename = `${rootPkg.version}.${getHash(content)}.json`;
    const fullPath = Path.join(this.dir.name, sourceFilename);
    fs.writeFileSync(fullPath, content);
    return fullPath;
  }

  dispose() {
    this.dir.removeCallback();
  }
}
