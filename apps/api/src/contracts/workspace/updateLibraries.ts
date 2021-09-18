import { S } from 'schema';
import { Workspace } from 'shared';
import { WorkspaceCollection } from '../../collections/Workspace';
import { AppError } from '../../common/errors';
import { mapWorkspace } from '../../common/mapper';
import { createContract, createRpcBinding } from '../../lib';
import { resolve } from '../dependency/resolve';

export const updateLibraries = createContract('workspace.updateLibraries')
  .params('id', 'libraries')
  .schema({
    id: S.string(),
    libraries: S.array().items(S.string()),
  })
  .returns<Workspace>()
  .fn(async (id, libraries) => {
    const workspace = await WorkspaceCollection.findById(id);
    if (!workspace) {
      throw new AppError('workspace not found');
    }
    const ret = await resolve(libraries);
    workspace.libraries = libraries;
    workspace.sourceBundles = ret.sourceBundles;
    workspace.typesBundles = ret.typesBundles;
    await WorkspaceCollection.update(workspace, [
      'libraries',
      'sourceBundles',
      'typesBundles',
    ]);
    return mapWorkspace(workspace);
  });

export const updateLibrariesRpc = createRpcBinding({
  public: true,
  signature: 'workspace.updateLibraries',
  handler: updateLibraries,
});
