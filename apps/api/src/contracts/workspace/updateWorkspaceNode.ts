import { S } from 'schema';
import { WorkspaceCollection } from '../../collections/Workspace';
import { createContract, createRpcBinding } from '../../lib';

export const updateWorkspaceNode = createContract(
  'workspace.updateWorkspaceNode'
)
  .params('values')
  .schema({
    values: S.object().keys({
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
  });

export const updateWorkspaceNodeRpc = createRpcBinding({
  public: true,
  signature: 'workspace.updateWorkspaceNode',
  handler: updateWorkspaceNode,
});
