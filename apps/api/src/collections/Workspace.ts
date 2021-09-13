import { ObjectID } from 'mongodb2';
import { WorkspaceNodeType } from 'shared';
import { createCollection } from '../db';

export interface WorkspaceNode {
  _id: string;
  name: string;
  content?: string;
  parentId: string | null;
  type: WorkspaceNodeType;
}

export interface WorkspaceModel {
  _id: string;
  nodes: WorkspaceNode[];
  accessKey: string;
  userId?: ObjectID;
  libraries: string[];
  libraryUrl: string;
}

export const WorkspaceCollection = createCollection<WorkspaceModel>(
  'workspace',
  [
    {
      key: {
        dedupKey: 1,
      },
      unique: true,
      sparse: true,
    },
  ]
);
