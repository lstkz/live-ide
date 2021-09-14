import { mocked } from 'ts-jest/utils';
import { BasicPackageInfo, fetchPackage } from '../src/jsdeliver';
import { PackageResolver } from '../src/PackageResolver';

jest.mock('../src/jsdeliver');

const mocked_fetchPackage = mocked(fetchPackage);

it('should fetch a single package', async () => {
  const resolver = new PackageResolver();
  mocked_fetchPackage.mockImplementation(async name => {
    switch (name) {
      case 'foo@*': {
        return {
          name: 'foo',
          version: '1.0.0',
          module: 'index.esm.js',
          dependencies: {},
        };
      }
      default:
        return null;
    }
  });
  await resolver.fetch('foo');
  expect(resolver.getPackages()).toMatchInlineSnapshot(`
Array [
  Object {
    "name": "foo",
    "requestedVersion": "*",
    "sourceName": "foo",
    "version": "1.0.0",
  },
]
`);
});

it('should fetch multiple packages package', async () => {
  const resolver = new PackageResolver();
  mocked_fetchPackage.mockImplementation(async name => {
    switch (name) {
      case 'foo@*': {
        return {
          name: 'foo',
          version: '1.0.0',
          module: 'index.esm.js',
          dependencies: {
            sub1: '1.0.0',
            sub2: '2.3.4',
          },
        } as BasicPackageInfo;
      }
      case 'sub1@1.0.0': {
        return {
          name: 'sub1',
          version: '1.0.0',
          module: 'index.esm.js',
          dependencies: {
            sub3: '2.0.0',
          },
        };
      }
      case 'sub2@2.3.4': {
        return {
          name: 'sub2',
          version: '2.3.4',
          module: 'index.esm.js',
          dependencies: {},
        };
      }
      case 'sub3@2.0.0': {
        return {
          name: 'sub3',
          version: '2.0.0',
          module: 'index.esm.js',
          dependencies: {},
        };
      }
      default:
        return null;
    }
  });
  await resolver.fetch('foo');
  expect(resolver.getPackages()).toMatchInlineSnapshot(`
Array [
  Object {
    "name": "foo",
    "requestedVersion": "*",
    "sourceName": "foo",
    "version": "1.0.0",
  },
  Object {
    "name": "sub1",
    "requestedVersion": "1.0.0",
    "sourceName": "sub1",
    "version": "1.0.0",
  },
  Object {
    "name": "sub2",
    "requestedVersion": "2.3.4",
    "sourceName": "sub2",
    "version": "2.3.4",
  },
  Object {
    "name": "sub3",
    "requestedVersion": "2.0.0",
    "sourceName": "sub3",
    "version": "2.0.0",
  },
]
`);
});

it('should handle a cycle', async () => {
  const resolver = new PackageResolver();
  mocked_fetchPackage.mockImplementation(async name => {
    switch (name) {
      case 'foo@1.0.0':
      case 'foo@*': {
        return {
          name: 'foo',
          version: '1.0.0',
          module: 'index.esm.js',
          dependencies: {
            bar: '1.0.0',
          },
        } as BasicPackageInfo;
      }
      case 'bar@1.0.0': {
        return {
          name: 'bar',
          version: '1.0.0',
          module: 'index.esm.js',
          dependencies: {
            baz: '1.0.0',
          },
        };
      }
      case 'baz@1.0.0': {
        return {
          name: 'baz',
          version: '1.0.0',
          module: 'index.esm.js',
          dependencies: {
            foo: '1.0.0',
          },
        };
      }
      default:
        return null;
    }
  });
  await resolver.fetch('foo');
  expect(resolver.getPackages()).toMatchInlineSnapshot(`
Array [
  Object {
    "name": "bar",
    "requestedVersion": "1.0.0",
    "sourceName": "bar",
    "version": "1.0.0",
  },
  Object {
    "name": "baz",
    "requestedVersion": "1.0.0",
    "sourceName": "baz",
    "version": "1.0.0",
  },
  Object {
    "name": "foo",
    "requestedVersion": "*",
    "sourceName": "foo",
    "version": "1.0.0",
  },
]
`);
});

it('should return an esm proxy package', async () => {
  const resolver = new PackageResolver();
  mocked_fetchPackage.mockImplementation(async name => {
    switch (name) {
      case 'foo@*': {
        return {
          name: 'foo',
          version: '1.0.0',
          dependencies: {
            bar: '1.0.0',
          },
        } as BasicPackageInfo;
      }
      case '@esm-bundle/foo@1.0.0': {
        return {
          name: '@esm-bundle/foo',
          version: '1.0.0',
          module: 'index.esm.js',
          dependencies: {},
        };
      }

      default:
        return null;
    }
  });
  await resolver.fetch('foo');
  expect(resolver.getPackages()).toMatchInlineSnapshot(`
Array [
  Object {
    "name": "@esm-bundle/foo",
    "requestedVersion": "1.0.0",
    "sourceName": "foo",
    "version": "1.0.0",
  },
]
`);
});

it('should return an esm proxy package (scoped)', async () => {
  const resolver = new PackageResolver();
  mocked_fetchPackage.mockImplementation(async name => {
    switch (name) {
      case '@types/foo@*': {
        return {
          name: '@types/foo',
          version: '1.0.0',
          dependencies: {
            bar: '1.0.0',
          },
        } as BasicPackageInfo;
      }
      case '@esm-bundle/types__foo@1.0.0': {
        return {
          name: '@esm-bundle/types__foo',
          version: '1.0.0',
          module: 'index.esm.js',
          dependencies: {},
        };
      }

      default:
        return null;
    }
  });
  await resolver.fetch('@types/foo');
  expect(resolver.getPackages()).toMatchInlineSnapshot(`
Array [
  Object {
    "name": "@esm-bundle/types__foo",
    "requestedVersion": "1.0.0",
    "sourceName": "@types/foo",
    "version": "1.0.0",
  },
]
`);
});

it('should throw if not found', async () => {
  const resolver = new PackageResolver();
  mocked_fetchPackage.mockImplementation(async () => {
    return null;
  });
  await expect(
    resolver.fetch('@types/foo')
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `"Package @types/foo@* not found."`
  );
});

it('should throw if not es module', async () => {
  const resolver = new PackageResolver();
  mocked_fetchPackage.mockImplementation(async name => {
    switch (name) {
      case 'foo@*': {
        return {
          name: 'foo',
          version: '1.0.0',
          dependencies: {
            bar: '1.0.0',
          },
        } as BasicPackageInfo;
      }
      default:
        return null;
    }
  });
  await expect(
    resolver.fetch('foo')
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `"Package foo@1.0.0 is not an ES module."`
  );
});

it('should throw if not @esm-bundle has no module prop', async () => {
  const resolver = new PackageResolver();
  mocked_fetchPackage.mockImplementation(async name => {
    switch (name) {
      case 'foo@*': {
        return {
          name: 'foo',
          version: '1.0.0',
          dependencies: {
            bar: '1.0.0',
          },
        } as BasicPackageInfo;
      }
      case '@esm-bundle/foo@1.0.0': {
        return {
          name: '@esm-bundle/foo',
          version: '1.0.0',
          dependencies: {
            bar: '1.0.0',
          },
        } as BasicPackageInfo;
      }
      default:
        return null;
    }
  });
  await expect(
    resolver.fetch('foo')
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `"Expected @esm-bundle/foo@1.0.0 to have a module property"`
  );
});
