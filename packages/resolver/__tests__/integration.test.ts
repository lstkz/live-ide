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
  expect(packages).toMatchInlineSnapshot(`
Array [
  Object {
    "name": "@babel/runtime",
    "requestedVersion": "^7.12.13",
    "version": "7.15.4",
  },
  Object {
    "name": "history",
    "requestedVersion": "^4.9.0",
    "version": "4.10.1",
  },
  Object {
    "name": "hoist-non-react-statics",
    "requestedVersion": "^3.1.0",
    "version": "3.3.2",
  },
  Object {
    "name": "isarray",
    "requestedVersion": "0.0.1",
    "version": "0.0.1",
  },
  Object {
    "name": "js-tokens",
    "requestedVersion": "^3.0.0 || ^4.0.0",
    "version": "4.0.0",
  },
  Object {
    "name": "loose-envify",
    "requestedVersion": "^1.3.1",
    "version": "1.4.0",
  },
  Object {
    "name": "mini-create-react-context",
    "requestedVersion": "^0.4.0",
    "version": "0.4.1",
  },
  Object {
    "name": "object-assign",
    "requestedVersion": "^4.1.1",
    "version": "4.1.1",
  },
  Object {
    "name": "path-to-regexp",
    "requestedVersion": "^1.7.0",
    "version": "1.8.0",
  },
  Object {
    "name": "prop-types",
    "requestedVersion": "^15.6.2",
    "version": "15.7.2",
  },
  Object {
    "name": "react-is",
    "requestedVersion": "^16.6.0",
    "version": "16.13.1",
  },
  Object {
    "name": "react-router",
    "requestedVersion": "5.2.1",
    "version": "5.2.1",
  },
  Object {
    "name": "regenerator-runtime",
    "requestedVersion": "^0.13.4",
    "version": "0.13.9",
  },
  Object {
    "name": "resolve-pathname",
    "requestedVersion": "^3.0.0",
    "version": "3.0.0",
  },
  Object {
    "name": "tiny-invariant",
    "requestedVersion": "^1.0.2",
    "version": "1.1.0",
  },
  Object {
    "name": "tiny-warning",
    "requestedVersion": "^1.0.0",
    "version": "1.0.3",
  },
  Object {
    "name": "value-equal",
    "requestedVersion": "^1.0.1",
    "version": "1.0.1",
  },
]
`);
  await downloader.downloadAll(packages);
  await resolver.resolve(['react-router']);
  const deps = resolver.getDeps();
  expect(deps).toMatchInlineSnapshot(`
Array [
  Object {
    "name": "@babel/runtime/helpers/esm/extends",
    "version": "7.15.4",
  },
  Object {
    "name": "@babel/runtime/helpers/esm/inheritsLoose",
    "version": "7.15.4",
  },
  Object {
    "name": "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose",
    "version": "7.15.4",
  },
  Object {
    "name": "history",
    "version": "4.10.1",
  },
  Object {
    "name": "hoist-non-react-statics",
    "version": "3.3.2",
  },
  Object {
    "name": "isarray",
    "version": "0.0.1",
  },
  Object {
    "name": "mini-create-react-context",
    "version": "0.4.1",
  },
  Object {
    "name": "object-assign",
    "version": "4.1.1",
  },
  Object {
    "name": "path-to-regexp",
    "version": "1.8.0",
  },
  Object {
    "name": "prop-types",
    "version": "15.7.2",
  },
  Object {
    "name": "react-is",
    "version": "16.13.1",
  },
  Object {
    "name": "react-router",
    "version": "5.2.1",
  },
  Object {
    "name": "resolve-pathname",
    "version": "3.0.0",
  },
  Object {
    "name": "tiny-invariant",
    "version": "1.1.0",
  },
  Object {
    "name": "tiny-warning",
    "version": "1.0.3",
  },
  Object {
    "name": "value-equal",
    "version": "1.0.1",
  },
]
`);
  await Promise.all(deps.map(dep => bundler.bundle(dep.name)));
});
