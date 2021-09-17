import { mocked } from 'ts-jest/utils';
import { BasicPackageInfo, fetchPackage } from '../src/jsdeliver';
import { PackageFetcher } from '../src/PackageFetcher';

jest.mock('../src/jsdeliver');

const mocked_fetchPackage = mocked(fetchPackage);

it('should fetch a single package', async () => {
  const resolver = new PackageFetcher();
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
    "version": "1.0.0",
  },
]
`);
});

it('should fetch multiple packages package', async () => {
  const resolver = new PackageFetcher();
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
    "version": "1.0.0",
  },
  Object {
    "name": "sub1",
    "requestedVersion": "1.0.0",
    "version": "1.0.0",
  },
  Object {
    "name": "sub2",
    "requestedVersion": "2.3.4",
    "version": "2.3.4",
  },
  Object {
    "name": "sub3",
    "requestedVersion": "2.0.0",
    "version": "2.0.0",
  },
]
`);
});

it('should handle a cycle', async () => {
  const resolver = new PackageFetcher();
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
    "version": "1.0.0",
  },
  Object {
    "name": "baz",
    "requestedVersion": "1.0.0",
    "version": "1.0.0",
  },
  Object {
    "name": "foo",
    "requestedVersion": "*",
    "version": "1.0.0",
  },
]
`);
});

it('should throw if not found', async () => {
  const resolver = new PackageFetcher();
  mocked_fetchPackage.mockImplementation(async () => {
    return null;
  });
  await expect(
    resolver.fetch('@types/foo')
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `"Package @types/foo@* not found."`
  );
});
