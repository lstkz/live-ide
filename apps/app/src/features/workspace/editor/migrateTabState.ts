import * as R from 'remeda';
import { TabsState } from 'code-editor/src/services/EditorStateService';
import { TreeNode } from 'src/types';

interface MigrateTabStateOptions {
  tabState: TabsState;
  nodes: TreeNode[];
  newNodes: TreeNode[];
  defaultNodePath?: string;
}

type TreeNodeWithPath = TreeNode & { path: string };

function _indexNodes(nodes: TreeNode[]) {
  const nodeMap = R.indexBy(nodes, x => x.id);

  const getPath = (node: TreeNode) => {
    const path = [node.name];
    while (node.parentId) {
      node = nodeMap[node.parentId];
      path.unshift(node.name);
    }
    return path.join('/');
  };
  const mapped: TreeNodeWithPath[] = nodes.map(node => ({
    ...node,
    path: getPath(node),
  }));
  const pathMap = R.indexBy(mapped, getPath);
  return [R.indexBy(mapped, x => x.id), pathMap];
}

export function migrateTabState(options: MigrateTabStateOptions) {
  const { tabState, nodes, newNodes, defaultNodePath } = options;
  const [nodeMap] = _indexNodes(nodes);
  const [, newPathMap] = _indexNodes(newNodes);
  const newTabState: TabsState = {
    activeTabId: null,
    tabs: [],
  };
  const mapOldId = (id: string) => {
    const oldNode = nodeMap[id];
    const newNode = newPathMap[oldNode.path];
    return newNode?.id;
  };
  if (tabState.activeTabId) {
    newTabState.activeTabId = mapOldId(tabState.activeTabId);
  }
  newTabState.tabs = tabState.tabs
    .map(tab => {
      return {
        id: mapOldId(tab.id),
        name: tab.name,
      };
    })
    .filter(tab => tab.id);
  if (defaultNodePath && !newTabState.tabs.length) {
    const defaultNode = newPathMap[defaultNodePath];
    if (defaultNode) {
      newTabState.tabs.push({
        id: defaultNode.id,
        name: defaultNode.name,
      });
      newTabState.activeTabId = defaultNode.id;
    }
  }
  return newTabState;
}
