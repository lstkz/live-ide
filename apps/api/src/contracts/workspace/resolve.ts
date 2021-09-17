import { config } from 'config';
import { S } from 'schema';
import { BundleHashCollection } from '../../collections/BundleHash';
import { PackageResolver } from '../../common/PackageResolver';
import { createContract, createRpcBinding, s3 } from '../../lib';

export const resolve = createContract('workspace.resolve')
  .params('libraries')
  .schema({
    libraries: S.array().items(S.string()),
  })
  .returns<{
    url: string;
  }>()
  .fn(async libraries => {
    const resolver = new PackageResolver();
    await Promise.all(libraries.map(lib => resolver.fetch(lib)));
    const hash = resolver.getHash();
    const bundle = await BundleHashCollection.findById(hash);
    const bundleName = `/bundle/${hash}.json`;
    if (!bundle) {
      await s3
        .upload({
          Bucket: config.aws.s3Bucket,
          Key: `cdn` + bundleName,
          Body: JSON.stringify(await resolver.getBundle()),
        })
        .promise();
      await BundleHashCollection.insertOne({
        _id: hash,
        createdAt: new Date(),
      });
    }
    return {
      url: config.cdnBaseUrl + bundleName,
    };
  });

export const resolveRpc = createRpcBinding({
  public: true,
  signature: 'workspace.resolve',
  handler: resolve,
});
