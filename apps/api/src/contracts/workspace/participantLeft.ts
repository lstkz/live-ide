import { S } from 'schema';
import { WorkspaceIdentity } from 'shared';
import { WorkspaceCollection } from '../../collections/Workspace';
import { WorkspaceParticipantCollection } from '../../collections/WorkspaceParticipant';
import { createContract, createEventBinding } from '../../lib';
import {
  dispatchParticipantsInfoUpdate,
  notifyOtherParticipants,
} from './_common';

export const participantLeft = createContract('workspace.participantLeft')
  .params('identity')
  .schema({
    identity: S.object().unknown().as<WorkspaceIdentity>(),
  })
  .returns<void>()
  .fn(async identity => {
    const workspace = await WorkspaceCollection.findById(identity.workspaceId);
    if (!workspace) {
      return;
    }
    await notifyOtherParticipants({
      workspaceId: workspace._id,
      identityId: identity.id,
      order: -1,
      data: {
        type: 'selection-updated',
        payload: {
          fromId: identity.id,
          selection: null,
        },
      },
    });
    await notifyOtherParticipants({
      workspaceId: workspace._id,
      identityId: identity.id,
      order: -1,
      data: {
        type: 'cursor-updated',
        payload: {
          fromId: identity.id,
          cursor: null,
        },
      },
    });
    await WorkspaceParticipantCollection.deleteMany({
      'identity.id': identity.id,
    });
    await dispatchParticipantsInfoUpdate(workspace._id);
  });

export const participantLeftEvent = createEventBinding({
  type: 'workspace-identity-disconnected',
  handler: async (_, event) => {
    await participantLeft(event.identity);
  },
});
