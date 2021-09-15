import Path from 'path';
import tmp from 'tmp';
import { rollup } from 'rollup';
import fs from 'fs';
import { extractLibName, getHash } from './utils';

export class Bundler {
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
    if (fs.existsSync(directFilePath)) {
      input = directFilePath;
    } else {
      const pkgPath = Path.join(path, 'package.json');
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      if (!pkg.module) {
        throw new Error('Expected module entry for ' + lib);
      }
      input = Path.join(path, pkg.module);
    }

    const build = await rollup({
      input: input,
      plugins: [
        {
          name: 'test',
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
      ],
    });
    const { output } = await build.generate({
      format: 'es',
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
