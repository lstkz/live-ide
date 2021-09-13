import { S } from 'schema';
import { PackageResolver } from '../../common/PackageResolver';
import { createContract, createRpcBinding } from '../../lib';

export const resolve = createContract('workspace.resolve')
  .params('libraries')
  .schema({
    libraries: S.array().items(S.string()),
  })
  .returns<Record<string, string>>()
  .fn(async libraries => {
    const resolver = new PackageResolver();
    await Promise.all(libraries.map(lib => resolver.fetch(lib)));
    return await resolver.getBundle();
  });

export const resolveRpc = createRpcBinding({
  public: true,
  signature: 'workspace.resolve',
  handler: resolve,
});
