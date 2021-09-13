import { NodeId, TreeNode, TreeNodeType } from 'src/types';

interface CheckDuplicatedOptions {
  name: string;
  items: TreeNode[];
  excludeId?: NodeId;
  type: TreeNodeType;
}

export function checkDuplicated(options: CheckDuplicatedOptions) {
  const { name, items, excludeId, type } = options;
  const set = new Set<string>();
  items.forEach(item => {
    if (item.type === type && item.id !== excludeId) {
      set.add(item.name.toLowerCase());
    }
  });
  return set.has(name.toLowerCase());
}
