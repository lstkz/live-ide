import { WorkspaceCollection } from '../../src/collections/Workspace';
import { deleteWorkspaceNode } from '../../src/contracts/workspace/deleteWorkspaceNode';
import { execContract, setupDb } from '../helper';
import { createSampleWorkspaces } from '../seed-data';

setupDb();

beforeEach(async () => {
  await createSampleWorkspaces();
});

it('should update node properly', async () => {
  await execContract(deleteWorkspaceNode, {
    values: {
      identityId: '1',
      workspaceId: 'w1',
      nodeId: 'node-1',
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
          "_id": "node-2",
          "content": "c2",
          "name": "n2",
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
