import { S } from 'schema';
import { WorkspaceCollection } from '../../collections/Workspace';
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
    await WorkspaceCollection.updateOne(
      {
        _id: values.workspaceId,
      },
      {
        $pull: {
          nodes: { _id: values.nodeId },
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
