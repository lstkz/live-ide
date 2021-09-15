import tmp from 'tmp';
import tar from 'tar';
import Path from 'path';
import fs from 'fs';
import mv from 'mv';
import { fetchNpmTar } from './npm';

interface DownloadPackageData {
  name: string;
  version: string;
}

export class PackageDownloader {
  private dir: tmp.DirResult;
  private downloaded = new Set<string>();

  constructor() {
    this.dir = tmp.dirSync();
  }

  async download(pkg: DownloadPackageData) {
    if (this.downloaded.has(pkg.name)) {
      return;
    }
    this.downloaded.add(pkg.name);
    const tarPath = await fetchNpmTar(pkg.name, pkg.version);
    const cwd = Path.join(this.dir.name, pkg.name);
    fs.mkdirSync(cwd, { recursive: true });
    await tar.x({
      file: tarPath,
      cwd,
    });
    const content = fs.readdirSync(cwd);
    if (content.length === 1) {
      const wrappedPath = Path.join(cwd, content[0]);
      await new Promise<void>((resolve, reject) =>
        mv(
          wrappedPath,
          cwd,
          {
            mkdirp: false,
            clobber: false,
          },
          err => (err ? reject(err) : resolve())
        )
      );
    }
  }

  async downloadAll(packages: DownloadPackageData[]) {
    await Promise.all(packages.map(pkg => this.download(pkg)));
  }

  getDir() {
    return this.dir.name;
  }

  dispose() {
    this.dir.removeCallback();
  }
}
