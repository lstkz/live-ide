import { fetchPackage } from './jsdeliver';
import { ResolverError } from './ResolverError';
import { ResolvedPackage } from './types';
import { splitVersion } from './utils';
import semver from 'semver';

export class PackageFetcher {
  private visited: Record<string, true> = {};
  private pkgMap: Record<string, ResolvedPackage> = {};

  async fetch(fullName: string) {
    const { name, version } = splitVersion(fullName);
    return this._fetch(name, version);
  }

  private async _fetch(name: string, version: string): Promise<void> {
    if (this.visited[name]) {
      return;
    }
    this.visited[name] = true;
    const fullName = name + '@' + version;
    const pkg = await fetchPackage(fullName);
    if (!pkg) {
      throw new ResolverError(`Package ${fullName} not found.`);
    }
    const existing = this.pkgMap[pkg.name];
    if (!existing || semver.lt(existing.version, pkg.version)) {
      this.pkgMap[name] = {
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
