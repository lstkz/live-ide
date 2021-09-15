import * as Path from 'path';
import { rollup } from 'rollup';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import { findPackage } from './utils';
import { BaseLibraryInfo } from './types';

export class DependencyResolver {
  private visitedDeps = new Set<string>();
  private resolvedDeps = new Set<BaseLibraryInfo>();
  private externalDeps = new Set<string>();

  constructor(private baseSourceDir: string) {}

  async resolve(libraries: string[]) {
    await Promise.all(libraries.map(lib => this.findAllDeps(lib)));
  }

  getDeps() {
    return [...this.resolvedDeps.values()]
      .filter(x => !this.externalDeps.has(x.name))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  private async findAllDeps(lib: string) {
    if (this.visitedDeps.has(lib)) {
      return;
    }
    this.visitedDeps.add(lib);
    const pkgData = findPackage(this.baseSourceDir, lib);
    if (!pkgData) {
      this.externalDeps.add(lib);
      // external
      return;
    }
    const { pkg } = pkgData;
    this.resolvedDeps.add({
      name: lib,
      version: pkg.version,
    });
    const isModule = Boolean(pkg.module);
    const input = isModule
      ? Path.join(this.baseSourceDir, lib, pkg.module)
      : Path.join(this.baseSourceDir, lib);
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
              if (!this.visitedDeps.has(target)) {
                newDeps.push(target);
              }
              return false;
            }
            return null;
          },
        },
        ...(isModule ? [] : [resolve(), commonjs()]),
      ],
    });
    await Promise.all(newDeps.map(dep => this.findAllDeps(dep)));
  }
}
