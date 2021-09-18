import tmp from 'tmp';
import tar from 'tar';
import Path from 'path';
import fs from 'fs';
import { fetchNpmTar } from './npm';

interface DownloadPackageData {
  name: string;
  version: string;
}

export class PackageDownloader {
  private dirHandle: tmp.DirResult;
  private downloaded = new Set<string>();
  private dir: string;

  constructor() {
    this.dirHandle = tmp.dirSync();
    this.dir = Path.join(this.dirHandle.name, 'node_modules');
    fs.mkdirSync(this.dir);
  }

  async download(pkg: DownloadPackageData) {
    if (this.downloaded.has(pkg.name)) {
      return;
    }
    this.downloaded.add(pkg.name);
    const tarPath = await fetchNpmTar(pkg.name, pkg.version);
    const cwd = Path.join(this.dir, pkg.name);
    fs.mkdirSync(cwd, { recursive: true });
    await tar.x({
      file: tarPath,
      cwd,
    });
    const content = fs.readdirSync(cwd);
    if (content.length === 1) {
      const wrappedPath = Path.join(cwd, content[0]);
      const tmpPath = tmp.dirSync();
      fs.renameSync(wrappedPath, tmpPath.name);
      fs.renameSync(tmpPath.name, cwd);
      tmpPath.removeCallback();
    }
  }

  async downloadAll(packages: DownloadPackageData[]) {
    await Promise.all(packages.map(pkg => this.download(pkg)));
  }

  getDir() {
    return this.dir;
  }

  dispose() {
    this.dirHandle.removeCallback();
  }
}
