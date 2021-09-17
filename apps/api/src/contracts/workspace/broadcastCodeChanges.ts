import { S } from 'schema';
import { CodeChange } from 'shared';
import { createContract, createRpcBinding } from '../../lib';
import { notifyOtherParticipants } from './_common';

export const broadcastCodeChanges = createContract(
  'workspace.broadcastCodeChanges'
)
  .params('values')
  .schema({
    values: S.object().keys({
      identityId: S.string(),
      workspaceId: S.string(),
      nodeId: S.string(),
      order: S.number(),
      changes: S.array().items(S.object().unknown().as<CodeChange>()),
    }),
  })
  .returns<void>()
  .fn(async values => {
    await notifyOtherParticipants({
      workspaceId: values.workspaceId,
      identityId: values.identityId,
      order: -1,
      data: {
        type: 'file-updated',
        payload: {
          changes: values.changes,
          nodeId: values.nodeId,
          fromId: values.identityId,
        },
      },
    });
  });

export const broadcastCodeChangesRpc = createRpcBinding({
  public: true,
  signature: 'workspace.broadcastCodeChanges',
  handler: broadcastCodeChanges,
});
