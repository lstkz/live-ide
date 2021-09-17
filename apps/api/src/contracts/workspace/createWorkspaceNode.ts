import { S } from 'schema';
import { FILENAME_MAX_LENGTH, FILENAME_REGEX, WorkspaceNodeType } from 'shared';
import { createContract, createRpcBinding } from '../../lib';
import {
  WorkspaceCollection,
  WorkspaceNode,
} from '../../collections/Workspace';
import { notifyOtherParticipants } from './_common';
import { renameId } from '../../common/helper';

export const createWorkspaceNode = createContract(
  'workspace.createWorkspaceNode'
)
  .params('values')
  .schema({
    values: S.object().keys({
      identityId: S.string(),
      workspaceId: S.string(),
      nodeId: S.string().uuid(),
      content: S.string().optional().nullable(),
      parentId: S.string().nullable().optional(),
      type: S.enum().values<WorkspaceNodeType>(
        Object.values(WorkspaceNodeType)
      ),
      name: S.string().max(FILENAME_MAX_LENGTH).regex(FILENAME_REGEX).trim(),
    }),
  })
  .returns<void>()
  .fn(async values => {
    const node: WorkspaceNode = {
      _id: values.nodeId,
      name: values.name,
      content: values.content ?? null,
      parentId: values.parentId ?? null,
      type: values.type,
    };
    await WorkspaceCollection.updateOne(
      {
        _id: values.workspaceId,
      },
      {
        $push: {
          nodes: node,
        },
      }
    );
    await notifyOtherParticipants({
      workspaceId: values.workspaceId,
      identityId: values.identityId,
      order: -1,
      data: {
        type: 'node-added',
        payload: renameId(node),
      },
    });
  });

export const createWorkspaceNodeRpc = createRpcBinding({
  public: true,
  signature: 'workspace.createWorkspaceNode',
  handler: createWorkspaceNode,
});
