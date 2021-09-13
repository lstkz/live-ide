import { BasicPackageInfo, fetchPackage } from './jsdeliver';
import semver from 'semver';
import Path from 'path';
import tar from 'tar';
import { fetchNpmTar } from './npm';

export class PackageResolver {
  private visited: Record<string, true> = {};
  private pkgMap: Record<string, BasicPackageInfo> = {};

  async fetch(name: string) {
    if (this.visited[name]) {
      return;
    }
    this.visited[name] = true;
    const pkg = await fetchPackage(name);
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

  async getBundle() {
    const files: Record<string, string> = {};
    await Promise.all(
      Object.values(this.pkgMap).map(async pkg => {
        const tarPath = await fetchNpmTar(pkg.name, pkg.version);
        await tar.x({
          file: tarPath,
          filter: path => {
            return ['.ts', '.tsx', '.css', '.js', '.jsx'].some(x =>
              path.endsWith(x)
            );
          },
          onentry: entry => {
            const data: Buffer[] = [];
            entry.on('data', c => {
              data.push(c);
            });
            entry.on('finish', () => {
              const targetPath = Path.join(
                pkg.name,
                Path.relative('package', entry.path)
              );
              files[targetPath] = Buffer.concat(data).toString('utf8');
            });
          },
        });
      })
    );
    return files;
  }
}
