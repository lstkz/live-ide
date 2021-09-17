import { S } from 'schema';
import { ParticipantSelection } from 'shared';
import { WorkspaceParticipantCollection } from '../../collections/WorkspaceParticipant';
import { createContract, createRpcBinding } from '../../lib';
import { notifyOtherParticipants } from './_common';

export const updateSelection = createContract('workspace.updateSelection')
  .params('values')
  .schema({
    values: S.object().keys({
      identityId: S.string(),
      workspaceId: S.string(),
      order: S.number(),
      selection: S.object()
        .nullable()
        .unknown()
        .as<ParticipantSelection | null>(),
    }),
  })
  .returns<void>()
  .fn(async values => {
    const { identityId, workspaceId, order, selection } = values;
    await WorkspaceParticipantCollection.findOneAndUpdate(
      {
        'identity.id': identityId,
      },
      {
        $set: {
          selection,
        },
      }
    );
    await notifyOtherParticipants({
      workspaceId,
      identityId,
      order,
      data: {
        type: 'selection-updated',
        payload: {
          fromId: identityId,
          selection,
        },
      },
    });
  });

export const updateSelectionRpc = createRpcBinding({
  injectUser: true,
  signature: 'workspace.updateSelection',
  handler: updateSelection,
});
