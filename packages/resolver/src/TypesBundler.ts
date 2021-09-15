import * as R from 'remeda';
import Path from 'path';
import tmp from 'tmp';
import fs from 'fs';
import { ExtractedBundle } from './types';
import { getDirectories, getEntryTypes, getHash, walk } from './utils';

export class TypesBundler {
  private dir: tmp.DirResult;

  constructor(private baseSourceDir: string) {
    this.dir = tmp.dirSync();
  }

  async extractBundles() {
    const ret: ExtractedBundle[] = [];
    const directories = R.pipe(
      getDirectories(this.baseSourceDir),
      R.flatMap(dirInfo => {
        if (dirInfo.name[0] === '@') {
          const sub = getDirectories(dirInfo.path);
          return sub.map(subDirInfo => ({
            name: dirInfo.name + '/' + subDirInfo.name,
            path: subDirInfo.path,
          }));
        } else {
          return dirInfo;
        }
      })
    );

    await Promise.all(
      directories.map(async dirInfo => {
        const bundle: Record<string, string> = {};
        const files = walk(dirInfo.path).filter(
          x => x.endsWith('.d.ts') || x.endsWith('/package.json')
        );
        files
          .filter(file => file.endsWith('.d.ts'))
          .forEach(file => {
            const relative = Path.relative(dirInfo.path, file);
            const content = fs.readFileSync(file, 'utf8');
            bundle[relative] = content;
          });
        files
          .filter(file => file.endsWith('.json'))
          .forEach(file => {
            const subPkg = JSON.parse(fs.readFileSync(file, 'utf8'));
            let entryTypes = getEntryTypes(subPkg);
            if (!entryTypes) {
              return;
            }
            const newIndexPath = Path.join(Path.dirname(file), 'index.d.ts');
            const relative = Path.relative(dirInfo.path, newIndexPath);
            if (bundle[relative]) {
              return;
            }
            if (!entryTypes.startsWith('.')) {
              entryTypes = './' + entryTypes;
            }
            const content = `export * from '${entryTypes.replace(
              '.d.ts',
              ''
            )}';\n`;
            bundle[relative] = content;
          });

        if (Object.keys(bundle).length) {
          const pkg = JSON.parse(
            fs.readFileSync(Path.join(dirInfo.path, 'package.json'), 'utf8')
          );
          const content = JSON.stringify(bundle);
          const sourceFilename = `${pkg.version}.${getHash(content)}.json`;
          const fullPath = Path.join(this.dir.name, sourceFilename);
          fs.writeFileSync(fullPath, content);
          ret.push({
            name: dirInfo.name,
            bundle: fullPath,
          });
        }
      })
    );
    return ret;
  }

  dispose() {
    this.dir.removeCallback();
  }
}
