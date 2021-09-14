import { fetchPackage } from './jsdeliver';
import { ResolverError } from './ResolverError';
import { ResolvedPackage } from './types';
import { convertToEsmBundleName, splitVersion } from './utils';
import semver from 'semver';

export class PackageResolver {
  private visited: Record<string, true> = {};
  private pkgMap: Record<string, ResolvedPackage> = {};

  async fetch(fullName: string) {
    const { name, version } = splitVersion(fullName);
    return this._fetch(name, version, name, false);
  }

  private async _fetch(
    name: string,
    version: string,
    sourceName: string,
    isESMProxy = false
  ): Promise<void> {
    if (this.visited[name]) {
      return;
    }
    this.visited[name] = true;
    const fullName = name + '@' + version;
    const pkg = await fetchPackage(fullName);
    if (!pkg) {
      if (isESMProxy) {
        throw new ResolverError(
          `Package ${sourceName}@${version} is not an ES module.`
        );
      }
      throw new ResolverError(`Package ${fullName} not found.`);
    }
    if (!pkg.module) {
      if (isESMProxy) {
        throw new ResolverError(
          `Expected ${fullName} to have a module property`
        );
      }
      return this._fetch(convertToEsmBundleName(name), pkg.version, name, true);
    }
    const existing = this.pkgMap[pkg.name];
    if (!existing || semver.lt(existing.version, pkg.version)) {
      this.pkgMap[sourceName] = {
        sourceName,
        name,
        version: pkg.version,
        requestedVersion: version,
      };
    }
    await Promise.all(
      Object.entries(pkg.dependencies).map(([name, version]) =>
        this.fetch(name + '@' + version)
      )
    );
  }

  getPackages() {
    return Object.values(this.pkgMap).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }
}
