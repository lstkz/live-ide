import { WorkspaceNodeType } from 'shared';
import { WorkspaceCollection } from '../src/collections/Workspace';

export async function createSampleWorkspaces() {
  await WorkspaceCollection.insertMany([
    {
      _id: 'w1',
      libraries: [],
      nodes: [
        {
          _id: 'node-1',
          name: 'n1',
          parentId: null,
          type: WorkspaceNodeType.File,
          content: 'c1',
        },
        {
          _id: 'node-2',
          name: 'n2',
          parentId: null,
          type: WorkspaceNodeType.File,
          content: 'c2',
        },
      ],
      sourceBundles: [],
      typesBundles: [],
    },
    {
      _id: 'w2',
      libraries: [],
      nodes: [
        {
          _id: 'node-1',
          name: 'n1',
          parentId: null,
          type: WorkspaceNodeType.File,
          content: 'c1',
        },
        {
          _id: 'node-2',
          name: 'n2',
          parentId: null,
          type: WorkspaceNodeType.File,
          content: 'c2',
        },
      ],
      sourceBundles: [],
      typesBundles: [],
    },
  ]);
}
