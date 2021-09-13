import { ObjectID } from 'mongodb2';
import { WorkspaceNodeType } from 'shared';
import { createCollection } from '../db';

export interface WorkspaceNodeModel {
  _id: string;
  workspaceId: ObjectID;
  userId: ObjectID;
  name: string;
  parentId: string | null;
  type: WorkspaceNodeType;
  hash: string;
  s3Key?: string | null;
  sourceS3Key?: string | null;
  uniqueKey: string;
  isLocked?: boolean | null;
}

export const WorkspaceNodeCollection = createCollection<WorkspaceNodeModel>(
  'workspaceItem',
  [
    {
      key: {
        workspaceId: 1,
      },
    },
    {
      key: {
        uniqueKey: 1,
      },
      unique: true,
    },
  ]
);
