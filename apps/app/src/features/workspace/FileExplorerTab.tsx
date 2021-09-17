import React from 'react';
import { useGetter } from 'src/hooks/useGetter';
import { FileExplorer } from '../../components/FileExplorer/FileExplorer';
import {
  useIsEditorLoaded,
  useWorkspaceModel,
  useWorkspaceState,
} from './editor/EditorModule';

export function FileExplorerTab() {
  const isLoaded = useIsEditorLoaded();
  const { nodes, nodeState } = useWorkspaceState();
  const workspaceModel = useWorkspaceModel();
  const getWorkspaceModel = useGetter(workspaceModel);
  if (!isLoaded) {
    return null;
  }
  return (
    <FileExplorer
      lockedNodesMap={{}}
      nodeState={nodeState}
      items={nodes}
      onOpenFile={id => getWorkspaceModel().openFile(id)}
      onNewFile={values => getWorkspaceModel().addNew(values)}
      onRemoved={id => getWorkspaceModel().removeNode(id)}
      onRename={(id, name) => getWorkspaceModel().renameNode(id, name)}
    />
  );
}
