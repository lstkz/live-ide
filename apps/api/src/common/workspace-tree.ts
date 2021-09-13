import * as uuid from 'uuid';
import { WorkspaceNodeType } from 'shared';
import { TemplateFile } from '../collections/Template';
import { WorkspaceNode } from '../collections/Workspace';

export function createWorkspaceNodes(files: TemplateFile[]) {
  const items: WorkspaceNode[] = [];
  const directoryMap: Record<string, WorkspaceNode> = {};
  const getDirectoryParts = (directoryPath: string) =>
    directoryPath.split('/').filter(x => x && x !== '.');
  const createDirectories = (directoryPath: string) => {
    const parts = getDirectoryParts(directoryPath);
    const currentParts: string[] = [];
    let parent: WorkspaceNode | null = null;
    parts.forEach(part => {
      currentParts.push(part);
      const path = currentParts.join('/');
      if (!directoryMap[path]) {
        directoryMap[path] = {
          _id: uuid.v4(),
          name: part,
          type: WorkspaceNodeType.Directory,
          parentId: parent?._id ?? null,
        };
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
      _id: uuid.v4(),
      type: WorkspaceNodeType.File,
      name: file.name,
      content: file.content,
      parentId: getParentId(file.directory),
    };
    items.push(node);
  });
  items.push(...Object.values(directoryMap));
  return items;
}
