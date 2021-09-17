import { S } from 'schema';
import { Workspace } from 'shared';
import { WorkspaceCollection } from '../../collections/Workspace';
import { AppError } from '../../common/errors';
import { mapWorkspace } from '../../common/mapper';
import { createContract, createRpcBinding } from '../../lib';

export const getWorkspace = createContract('workspace.getWorkspace')
  .params('id')
  .schema({
    id: S.string(),
  })
  .returns<Workspace>()
  .fn(async id => {
    const workspace = await WorkspaceCollection.findById(id);
    if (!workspace) {
      throw new AppError('workspace not found');
    }
    return mapWorkspace(workspace);
  });

export const getWorkspaceRpc = createRpcBinding({
  public: true,
  signature: 'workspace.getWorkspace',
  handler: getWorkspace,
});
