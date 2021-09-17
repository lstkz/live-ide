import { ObjectID } from 'mongodb';
import { S } from 'schema';
import { WorkspaceIdentity } from 'shared';
import { WorkspaceCollection } from '../../collections/Workspace';
import { WorkspaceParticipantCollection } from '../../collections/WorkspaceParticipant';
import { createContract, createEventBinding } from '../../lib';
import { dispatchParticipantsInfoUpdate } from './_common';

export const participantJoined = createContract('workspace.participantJoined')
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
    await WorkspaceParticipantCollection.insertOne({
      _id: new ObjectID(),
      identity,
      cursor: null,
      selection: null,
    });
    await dispatchParticipantsInfoUpdate(workspace._id);
  });

export const participantJoinedEvent = createEventBinding({
  type: 'workspace-identity-connected',
  handler: async (_, event) => {
    await participantJoined(event.identity);
  },
});
