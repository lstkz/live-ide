import * as R from 'remeda';
import { NodeId, RecDirectoryNode, RecTreeNode, TreeNode } from '../types';

export class FileTreeHelper {
  private nodeMap: Record<string, TreeNode>;

  constructor(private nodes: TreeNode[]) {
    this.nodeMap = R.indexBy(nodes, x => x.id);
  }

  getPath(id: string) {
    let file = this.nodeMap[id];
    const path = [file.name];
    while (file.parentId) {
      file = this.nodeMap[file.parentId];
      path.unshift(file.name);
    }
    return './' + path.join('/');
  }

  flattenDirectory(id: string) {
    const ret: TreeNode[] = [];
    const childrenMap = this.getChildrenMap();
    const travel = (node: TreeNode) => {
      ret.push(node);
      if (node.type === 'directory') {
        const children = childrenMap[node.id] ?? [];
        children.forEach(travel);
      }
    };
    travel(this.nodeMap[id]);
    return ret;
  }

  getChildrenMap() {
    const childrenMap: Record<string, TreeNode[]> = {};
    this.nodes.forEach(node => {
      if (node.parentId) {
        if (!childrenMap[node.parentId]) {
          childrenMap[node.parentId] = [];
        }
        childrenMap[node.parentId].push(node);
      }
    });
    return childrenMap;
  }

  buildRecTree(): RecTreeNode[] {
    const childrenMap: Record<string, TreeNode[]> = this.getChildrenMap();
    const recNodes = this.nodes.map(node => {
      if (node.type === 'file') {
        return node;
      }
      const recDir: RecDirectoryNode = {
        ...node,
        children: [],
      };
      return recDir;
    });
    const recNodeMap = R.indexBy(recNodes, x => x.id);
    recNodes.forEach(node => {
      if (node.type === 'directory') {
        const children = childrenMap[node.id] ?? [];
        node.children = children.map(child => recNodeMap[child.id]);
      }
    });
    sortRecNodes(recNodes);
    const rootNodes = recNodes.filter(x => !x.parentId);
    return rootNodes;
  }
}

function sortNodes<T extends TreeNode>(nodes: T[]) {
  nodes.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === 'directory' ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });
  return nodes;
}

export function sortRecNodes(nodes: RecTreeNode[]) {
  const travel = (nodes: RecTreeNode[]): RecTreeNode[] => {
    const sorted = sortNodes(nodes);
    sorted.forEach(node => {
      if (node.type === 'directory') {
        travel(node.children);
      }
    });
    return sorted;
  };
  travel(nodes);
  return nodes;
}

export function getVisibleNodes(
  nodes: RecTreeNode[],
  expandedDirectories: Record<NodeId, boolean>
) {
  const ret: RecTreeNode[] = [];
  const travel = (items: RecTreeNode[]) => {
    items.forEach(item => {
      ret.push(item);
      if (item.type === 'directory' && expandedDirectories[item.id]) {
        travel(item.children);
      }
    });
  };
  travel(nodes);

  return ret;
}

export function findFileByPath(tree: RecTreeNode[], path: string) {
  const split = path.split('/');
  if (split[0] === '.') {
    split.shift();
  }
  const fileName = split.pop()!;
  while (split.length) {
    throw new Error('TODO');
  }
  return tree.find(
    node =>
      node.type === 'file' && node.name.toLowerCase() === fileName.toLowerCase()
  )!;
}
