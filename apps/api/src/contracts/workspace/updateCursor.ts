import { S } from 'schema';
import { ParticipantCursor } from 'shared';
import { WorkspaceParticipantCollection } from '../../collections/WorkspaceParticipant';
import { createContract, createRpcBinding } from '../../lib';
import { notifyOtherParticipants } from './_common';

export const updateCursor = createContract('workspace.updateCursor')
  .params('values')
  .schema({
    values: S.object().keys({
      identityId: S.string(),
      workspaceId: S.string(),
      order: S.number(),
      cursor: S.object().nullable().unknown().as<ParticipantCursor | null>(),
    }),
  })
  .returns<void>()
  .fn(async values => {
    const { identityId, workspaceId, order, cursor } = values;
    await WorkspaceParticipantCollection.findOneAndUpdate(
      {
        'identity.id': identityId,
      },
      {
        $set: {
          cursor,
        },
      }
    );
    await notifyOtherParticipants({
      workspaceId,
      identityId,
      order,
      data: {
        type: 'cursor-updated',
        payload: {
          fromId: identityId,
          cursor,
        },
      },
    });
  });

export const updateCursorRpc = createRpcBinding({
  injectUser: true,
  signature: 'workspace.updateCursor',
  handler: updateCursor,
});
