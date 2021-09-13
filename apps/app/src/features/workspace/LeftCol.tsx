import React from 'react';
import { useWorkspaceState } from './WorkspaceModule';
import { FileExplorerTab } from './FileExplorerTab';

export function LeftCol() {
  const { leftSidebarTab } = useWorkspaceState();
  return (
    <div tw="h-full flex flex-col bg-gray-900 p-3 overflow-auto">
      {leftSidebarTab === 'file-explorer' && <FileExplorerTab />}
    </div>
  );
}
