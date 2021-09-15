import { S } from 'schema';
import * as R from 'remeda';
import fs from 'fs';
import Path from 'path';
import { createContract, createRpcBinding, s3 } from '../../lib';
import {
  PackageFetcher,
  PackageDownloader,
  SourceBundler,
  TypesBundler,
  DependencyResolver,
  splitVersion,
} from 'resolver';
import mime from 'mime';
import semver from 'semver';
import { config } from 'config';
import { Bundle } from 'shared';
import { BundleCacheCollection } from '../../collections/BundleCache';
import { DUPLICATED_UNIQUE_VALUE_ERROR_CODE } from '../../common/mongo';

async function uploadFile(subDir: string, file: string) {
  const filename = Path.basename(file);
  const key = `npm/${subDir}/${filename}`;
  const fullKey = `cdn/${key}`;
  const exists = await s3
    .headObject({
      Bucket: config.aws.s3Bucket,
      Key: fullKey,
    })
    .promise()
    .then(
      () => true,
      err => {
        if (err.code === 'NotFound') {
          return false;
        }
        throw err;
      }
    );
  if (!exists) {
    await s3
      .upload({
        Bucket: config.aws.s3Bucket,
        Key: fullKey,
        Body: fs.readFileSync(file),
        ContentType: mime.lookup(file),
      })
      .promise();
  }
  return `${config.cdnBaseUrl}/${key}`;
}

interface BundleResolution {
  sourceBundles: Bundle[];
  typesBundles: Bundle[];
}

async function resolveSingleNoCache(lib: string): Promise<BundleResolution> {
  const fetcher = new PackageFetcher();
  const downloader = new PackageDownloader();
  const resolver = new DependencyResolver(downloader.getDir());
  const sourceBundler = new SourceBundler(downloader.getDir());
  const typesBundler = new TypesBundler(downloader.getDir());
  await fetcher.fetch(lib);
  const packages = fetcher.getPackages();
  await downloader.downloadAll(packages);
  const { name } = splitVersion(lib);
  await resolver.resolve([name]);
  const deps = resolver.getDeps();
  const sourceBundles = await Promise.all(
    deps.map(async dep => {
      const path = await sourceBundler.bundle(dep.name);
      return {
        ...dep,
        url: await uploadFile(dep.name, path),
      };
    })
  );
  const typesBundles = await typesBundler.extractBundles();
  return {
    sourceBundles,
    typesBundles: await Promise.all(
      typesBundles.map(async dep => {
        return {
          name: dep.name,
          version: dep.version,
          url: await uploadFile(dep.name, dep.bundle),
        };
      })
    ),
  };
}

async function resolveSingle(lib: string): Promise<BundleResolution> {
  const fetcher = new PackageFetcher();
  const libExact = await fetcher.getExactVersion(lib);
  let bundleCache = await BundleCacheCollection.findById(libExact);
  if (!bundleCache) {
    bundleCache = {
      _id: libExact,
      ...(await resolveSingleNoCache(libExact)),
    };
    try {
      await BundleCacheCollection.insertOne(bundleCache);
    } catch (e: any) {
      if (e.code !== DUPLICATED_UNIQUE_VALUE_ERROR_CODE) {
        throw e;
      }
    }
  }
  return R.pick(bundleCache, ['sourceBundles', 'typesBundles']);
}

function _filterDuplicates(items: Bundle[]) {
  const max: Record<string, string> = {};
  items.forEach(item => {
    if (!max[item.name] || semver.lt(max[item.name], item.version)) {
      max[item.name] = item.version;
    }
  });
  const dup = new Set<string>();
  return items.filter(item => {
    if (dup.has(item.name) || item.version !== max[item.name]) {
      return false;
    }
    dup.add(item.name);
    return true;
  });
}

export const resolve = createContract('dependency.resolve')
  .params('libraries')
  .schema({
    libraries: S.array().items(S.string()),
  })
  .returns<BundleResolution>()
  .fn(async libraries => {
    const items = await Promise.all(libraries.map(resolveSingle));
    const ret: BundleResolution = {
      sourceBundles: _filterDuplicates(R.flatMap(items, x => x.sourceBundles)),
      typesBundles: _filterDuplicates(R.flatMap(items, x => x.typesBundles)),
    };
    return ret;
  });

export const resolveRpc = createRpcBinding({
  public: true,
  signature: 'dependency.resolve',
  handler: resolve,
});
