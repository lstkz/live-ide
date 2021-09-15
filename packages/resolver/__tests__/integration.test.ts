import { Bundler } from '../src/Bundler';
import { DependencyResolver } from '../src/DependencyResolver';
import { PackageDownloader } from '../src/PackageDownloader';
import { PackageFetcher } from '../src/PackageFetcher';

it('download and bundle libraries', async () => {
  const fetcher = new PackageFetcher();
  const downloader = new PackageDownloader();
  const resolver = new DependencyResolver(downloader.getDir());
  const bundler = new Bundler(downloader.getDir());

  await fetcher.fetch('react-router@5.2.1');
  const packages = fetcher.getPackages();
  console.log({ packages });
  await downloader.downloadAll(packages);
  await resolver.resolve(packages.map(x => x.name));
  const deps = resolver.getDeps();
  expect(deps).toMatchInlineSnapshot();
});
