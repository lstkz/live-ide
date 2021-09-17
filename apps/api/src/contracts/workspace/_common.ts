import { WorkspaceUpdateType } from 'shared';
import { WorkspaceParticipantCollection } from '../../collections/WorkspaceParticipant';
import { getSocketId } from '../../common/helper';
import { dispatchSocketMsg } from '../../dispatch';

export async function dispatchParticipantsInfoUpdate(workspaceId: string) {
  const participants = await WorkspaceParticipantCollection.findAll({
    'identity.workspaceId': workspaceId,
  });
  await Promise.all(
    participants.map(async target => {
      await dispatchSocketMsg({
        type: 'workspace-update',
        payload: {
          data: {
            type: 'participants-info',
            payload: {
              participants,
            },
          },
          socketId: getSocketId(target.identity),
          workspaceId,
          order: -1,
        },
      });
    })
  );
}

interface NotifyOthersParticipantsOptions {
  workspaceId: string;
  identityId: string;
  order: number;
  data: WorkspaceUpdateType;
}

export async function notifyOtherParticipants(
  options: NotifyOthersParticipantsOptions
) {
  const { data, identityId, order, workspaceId } = options;
  const otherParticipants = await WorkspaceParticipantCollection.findAll({
    'identity.id': { $ne: identityId },
    'identity.workspaceId': workspaceId,
  });
  await Promise.all(
    otherParticipants.map(async target => {
      await dispatchSocketMsg({
        type: 'workspace-update',
        payload: {
          data: data,
          socketId: getSocketId(target.identity),
          workspaceId,
          order,
        },
      });
    })
  );
}
