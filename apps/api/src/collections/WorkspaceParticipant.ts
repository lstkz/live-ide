import { ObjectId } from 'aws-sdk/clients/codecommit';
import { ParticipantInfo, WorkspaceIdentity } from 'shared';
import { createCollection } from '../db';

export interface WorkspaceParticipantModel extends ParticipantInfo {
  _id: ObjectId;
  identity: WorkspaceIdentity;
}

export const WorkspaceParticipantCollection =
  createCollection<WorkspaceParticipantModel>('workspaceParticipant', [
    {
      key: {
        'identity.workspaceId': 1,
      },
    },
    {
      key: {
        'identity.id': 1,
      },
    },
  ]);
