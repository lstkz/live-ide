import React from 'react';
import * as R from 'remeda';
import { useGetter } from 'src/hooks/useGetter';
import { TreeNode } from 'src/types';
import { FileExplorer } from '../../components/FileExplorer/FileExplorer';
import {
  useEditorState,
  useIsEditorLoaded,
  useWorkspaceModel,
  useWorkspaceState,
} from './editor/EditorModule';

export function FileExplorerTab() {
  const isLoaded = useIsEditorLoaded();
  const { nodes, nodeState } = useWorkspaceState();
  const { workspace } = useEditorState();
  const workspaceModel = useWorkspaceModel();
  const getWorkspaceModel = useGetter(workspaceModel);
  const lockedNodesMap = React.useMemo(() => {
    const lockedNodesMap: Record<string, boolean> = {};
    const nodeMap = R.indexBy(nodes, x => x.id);
    const travel = (node: TreeNode) => {
      lockedNodesMap[node.id] = true;
      if (node.parentId) {
        travel(nodeMap[node.parentId]);
      }
    };
    workspace.items.filter(x => x.isLocked).forEach(travel);
    return lockedNodesMap;
  }, [workspace]);
  if (!isLoaded) {
    return null;
  }
  return (
    <FileExplorer
      lockedNodesMap={lockedNodesMap}
      nodeState={nodeState}
      items={nodes}
      onOpenFile={id => getWorkspaceModel().openFile(id)}
      onNewFile={values => getWorkspaceModel().addNew(values)}
      onRemoved={id => getWorkspaceModel().removeNode(id)}
      onRename={(id, name) => getWorkspaceModel().renameNode(id, name)}
    />
  );
}
