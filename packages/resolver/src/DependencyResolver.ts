import * as Path from 'path';
import { rollup } from 'rollup';
import { findPackage } from './utils';

export class DependencyResolver {
  private resolvedDeps = new Set<string>();

  constructor(private baseSourceDir: string) {}

  async resolve(libraries: string[]) {
    await Promise.all(libraries.map(lib => this.findAllDeps(lib)));
  }

  getDeps() {
    return [...this.resolvedDeps.values()];
  }

  private async findAllDeps(lib: string) {
    if (this.resolvedDeps.has(lib)) {
      return;
    }
    this.resolvedDeps.add(lib);
    const { pkg, pkgPath } = findPackage(this.baseSourceDir, lib);
    if (!pkg.module) {
      throw new Error(`Package ${lib} has no module entry.`);
    }
    const input = Path.join(Path.dirname(pkgPath), pkg.module);
    const newDeps: string[] = [];
    await rollup({
      input: input,
      plugins: [
        {
          name: 'check-deps',
          resolveId: target => {
            if (/\0/.test(target)) {
              return null;
            }
            if (/^[@a-zA-Z0-9]/.test(target)) {
              if (!this.resolvedDeps.has(target)) {
                newDeps.push(target);
              }
              return false;
            }
            return null;
          },
        },
      ],
    });
    await Promise.all(newDeps.map(dep => this.findAllDeps(dep)));
  }
}
