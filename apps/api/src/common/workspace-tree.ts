import {
  WorkspaceNodeCollection,
  WorkspaceNodeModel,
} from '../collections/WorkspaceNode';
import * as uuid from 'uuid';
import { WorkspaceNodeType } from 'shared';

export function getNodeUniqueKey(
  node: Pick<WorkspaceNodeModel, 'workspaceId' | 'parentId' | 'type' | 'name'>
) {
  const parts = [
    node.workspaceId,
    node.parentId ?? '',
    node.type,
    node.name.toLowerCase(),
  ];
  return parts.join('_');
}

export function getWorkspaceNodeWithUniqueKey(
  node: Omit<WorkspaceNodeModel, 'uniqueKey'>
) {
  const ret: WorkspaceNodeModel = {
    ...node,
    uniqueKey: getNodeUniqueKey(node),
  };
  return ret;
}

export function createWorkspaceNodes(
  baseProps: Pick<WorkspaceNodeModel, 'workspaceId' | 'userId'>,
  // TODO
  files: any[]
) {
  const items: WorkspaceNodeModel[] = [];
  const directoryMap: Record<string, WorkspaceNodeModel> = {};
  const getDirectoryParts = (directoryPath: string) =>
    directoryPath.split('/').filter(x => x && x !== '.');
  const createDirectories = (directoryPath: string) => {
    const parts = getDirectoryParts(directoryPath);
    const currentParts: string[] = [];
    let parent: WorkspaceNodeModel | null = null;
    parts.forEach(part => {
      currentParts.push(part);
      const path = currentParts.join('/');
      if (!directoryMap[path]) {
        directoryMap[path] = {
          ...baseProps,
          _id: uuid.v4(),
          hash: 'init',
          name: part,
          type: WorkspaceNodeType.Directory,
          parentId: parent?._id ?? null,
          uniqueKey: '',
        };
        directoryMap[path].uniqueKey = getNodeUniqueKey(directoryMap[path]);
      }
      parent = directoryMap[path];
    });
  };
  const getParentId = (directoryPath: string) => {
    if (!directoryPath || directoryPath === '.') {
      return null;
    }
    const normalizedPath = getDirectoryParts(directoryPath).join('/');
    if (!directoryMap[normalizedPath]) {
      createDirectories(directoryPath);
    }
    return directoryMap[normalizedPath]._id;
  };
  files.forEach(file => {
    const node = {
      ...baseProps,
      _id: uuid.v4(),
      hash: 'init',
      name: file.name,
      type: WorkspaceNodeType.File,
      parentId: getParentId(file.directory),
      sourceS3Key: file.s3Key,
      uniqueKey: '',
      isLocked: file.isLocked,
    };
    node.uniqueKey = getNodeUniqueKey(node);
    items.push(node);
  });
  items.push(...Object.values(directoryMap));
  return items;
}

export async function findNodeAllChildren(parentId: string) {
  const ret: WorkspaceNodeModel[] = [];
  const travel = async (parentId: string) => {
    const children = await WorkspaceNodeCollection.findAll({ parentId });
    ret.push(...children);
    await Promise.all(children.map(child => travel(child._id)));
  };
  await travel(parentId);
  return ret;
}
