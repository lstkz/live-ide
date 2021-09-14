import { S } from 'schema';
import { BasicPackageInfo, fetchPackage } from '../../common/jsdeliver';
import { createContract, createRpcBinding } from '../../lib';
import semver from 'semver';
import { AppError } from '../../common/errors';

interface LibraryInfo {
  name: string;
  sourceName: string;
  version: string;
  requestedVersion: string;
  typesBundleUrl: string;
  sourceUrl: string;
}

function _convertToEsmBundleName(name: string) {
  if (name[0] === '@') {
    return '@esm-bundle/' + name.substring(1).replace('/', '__');
  }
  return '@esm-bundle/' + name;
}

interface ResolvedPackage {
  name: string;
  sourceName: string;
  version: string;
}

function _removeVersion(name: string) {
  const idx = name.lastIndexOf('@');
  if (idx === 0) {
    return name;
  }
  return name.substring();
}

export class PackageResolver {
  private visited: Record<string, true> = {};
  private pkgMap: Record<string, ResolvedPackage> = {};

  async fetch(name: string) {
    return this._fetch(name, name, false);
  }

  private async _fetch(
    name: string,
    sourceName: string,
    isESMProxy = false
  ): Promise<void> {
    if (this.visited[name]) {
      return;
    }
    this.visited[name] = true;
    const pkg = await fetchPackage(name);
    if (!pkg.module) {
      if (isESMProxy) {
        throw new AppError(`Package ${name} is not an ES module.`);
      }
      return this._fetch(_convertToEsmBundleName(name), name, isESMProxy);
    }
    const existing = this.pkgMap[pkg.name];
    if (!existing || semver.lt(existing.version, pkg.version)) {
      this.pkgMap[pkg.name] = pkg;
    }
    await Promise.all(
      Object.entries(pkg.dependencies).map(([name, version]) =>
        this.fetch(name + '@' + version)
      )
    );
  }
}

export const resolve = createContract('dependency.resolve')
  .params('library')
  .schema({
    library: S.string(),
  })
  .returns<LibraryInfo[]>()
  .fn(async library => {
    const pkg = await fetchPackage(library);
    const visited: Record<string, true> = {};

    return [];
  });

export const resolveRpc = createRpcBinding({
  public: true,
  signature: 'dependency.resolve',
  handler: resolve,
});
