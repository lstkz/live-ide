import { S } from 'schema';
import { WorkspaceCollection } from '../../collections/Workspace';
import { AppError } from '../../common/errors';
import { createContract, createRpcBinding } from '../../lib';
import { notifyOtherParticipants } from './_common';

export const deleteWorkspaceNode = createContract(
  'workspace.deleteWorkspaceNode'
)
  .params('values')
  .schema({
    values: S.object().keys({
      identityId: S.string(),
      workspaceId: S.string(),
      nodeId: S.string(),
    }),
  })
  .returns<void>()
  .fn(async values => {
    const workspace = await WorkspaceCollection.findById(values.workspaceId);
    if (!workspace) {
      throw new AppError('Workspace not found');
    }
    const node = workspace.nodes.find(x => x._id === values.nodeId);
    if (!node) {
      return;
    }
    const toRemove: string[] = [node._id];
    const travel = (parentId: string) => {
      const children = workspace.nodes.filter(
        node => node.parentId === parentId
      );
      toRemove.push(...children.map(x => x._id));
      children.forEach(node => {
        travel(node._id);
      });
    };
    travel(node._id);
    await WorkspaceCollection.updateOne(
      {
        _id: values.workspaceId,
      },
      {
        $pull: {
          nodes: { _id: { $in: toRemove } },
        },
      }
    );
    await notifyOtherParticipants({
      workspaceId: values.workspaceId,
      identityId: values.identityId,
      order: -1,
      data: {
        type: 'node-removed',
        payload: {
          id: values.nodeId,
        },
      },
    });
  });

export const deleteWorkspaceNodeRpc = createRpcBinding({
  public: true,
  signature: 'workspace.deleteWorkspaceNode',
  handler: deleteWorkspaceNode,
});
