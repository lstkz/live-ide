import { ObjectID } from 'mongodb2';
import { Bundle, WorkspaceNodeType } from 'shared';
import { createCollection } from '../db';

export interface WorkspaceNode {
  _id: string;
  name: string;
  content?: string | null;
  parentId: string | null;
  type: WorkspaceNodeType;
}

export interface WorkspaceModel {
  _id: string;
  nodes: WorkspaceNode[];
  userId?: ObjectID;
  libraries: string[];
  sourceBundles: Bundle[];
  typesBundles: Bundle[];
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
