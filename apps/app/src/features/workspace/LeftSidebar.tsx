import React from 'react';
import { ChallengeSidebar } from './ChallengeSidebar';
import { faCopy } from '@fortawesome/free-solid-svg-icons';
import { useWorkspaceActions, useWorkspaceState } from './WorkspaceModule';

export function LeftSidebar() {
  const { setLeftSidebarTab } = useWorkspaceActions();
  const { leftSidebarTab } = useWorkspaceState();
  return (
    <ChallengeSidebar
      tooltipPlace="right"
      onSelect={name => {
        if (leftSidebarTab === name) {
          setLeftSidebarTab(null);
        } else {
          setLeftSidebarTab(name);
        }
      }}
      items={[
        {
          name: 'file-explorer',
          label: 'File Explorer',
          fa: faCopy,
          current: leftSidebarTab === 'file-explorer',
        },
      ]}
    />
  );
}
