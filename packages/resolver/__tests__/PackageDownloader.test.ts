import Path from 'path';
import fs from 'fs';
import { PackageDownloader } from '../src/PackageDownloader';

let downloader: PackageDownloader = null!;

beforeEach(() => {
  downloader = new PackageDownloader();
});

afterEach(() => {
  downloader.dispose();
});

it('should download the source (react)', async () => {
  await downloader.download({
    name: 'react',
    version: '17.0.2',
  });
  const pkg = Path.join(downloader.getDir(), 'react', 'package.json');
  expect(fs.existsSync(pkg)).toEqual(true);
});

it('should download the source (@types/react)', async () => {
  await downloader.download({
    name: '@types/react',
    version: '17.0.2',
  });
  const pkg = Path.join(downloader.getDir(), '@types/react', 'package.json');
  expect(fs.existsSync(pkg)).toEqual(true);
});
