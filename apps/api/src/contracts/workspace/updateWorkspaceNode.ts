import { S } from 'schema';
import { WorkspaceCollection } from '../../collections/Workspace';
import { createContract, createRpcBinding } from '../../lib';
import { notifyOtherParticipants } from './_common';

export const updateWorkspaceNode = createContract(
  'workspace.updateWorkspaceNode'
)
  .params('values')
  .schema({
    values: S.object().keys({
      identityId: S.string(),
      workspaceId: S.string(),
      nodeId: S.string(),
      name: S.string().optional(),
      content: S.string().optional(),
    }),
  })
  .returns<void>()
  .fn(async values => {
    const setValues: any = {};
    if (values.name != null) {
      setValues['nodes.$.name'] = values.name;
    }
    if (values.content != null) {
      setValues['nodes.$.content'] = values.content;
    }
    await WorkspaceCollection.updateOne(
      {
        _id: values.workspaceId,
        'nodes._id': values.nodeId,
      },
      {
        $set: setValues,
      }
    );

    if (values.name != null) {
      await notifyOtherParticipants({
        workspaceId: values.workspaceId,
        identityId: values.identityId,
        order: -1,
        data: {
          type: 'node-updated',
          payload: {
            id: values.nodeId,
            name: values.name,
          },
        },
      });
    }
  });

export const updateWorkspaceNodeRpc = createRpcBinding({
  public: true,
  signature: 'workspace.updateWorkspaceNode',
  handler: updateWorkspaceNode,
});
