import { WorkspaceNodeType } from 'shared';
import { WorkspaceCollection } from '../../src/collections/Workspace';
import { createWorkspaceNode } from '../../src/contracts/workspace/createWorkspaceNode';
import { execContract, getUUID, setupDb } from '../helper';
import { createSampleWorkspaces } from '../seed-data';

setupDb();

beforeEach(async () => {
  await createSampleWorkspaces();
});

it('should update node properly', async () => {
  await execContract(createWorkspaceNode, {
    values: {
      workspaceId: 'w1',
      nodeId: getUUID(1),
      name: 'name',
      content: 'content',
      type: WorkspaceNodeType.File,
    },
  });
  const workspaces = await WorkspaceCollection.findAll(
    {},
    { sort: { _id: 1 } }
  );
  expect(workspaces.map(x => x.nodes)).toMatchInlineSnapshot(`
    Array [
      Array [
        Object {
          "_id": "node-1",
          "content": "c1",
          "name": "n1",
          "parentId": null,
          "type": "file",
        },
        Object {
          "_id": "node-2",
          "content": "c2",
          "name": "n2",
          "parentId": null,
          "type": "file",
        },
        Object {
          "_id": "00000000-0000-4000-8000-000000000001",
          "content": "content",
          "name": "name",
          "parentId": null,
          "type": "file",
        },
      ],
      Array [
        Object {
          "_id": "node-1",
          "content": "c1",
          "name": "n1",
          "parentId": null,
          "type": "file",
        },
        Object {
          "_id": "node-2",
          "content": "c2",
          "name": "n2",
          "parentId": null,
          "type": "file",
        },
      ],
    ]
  `);
});
