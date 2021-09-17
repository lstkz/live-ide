import React from 'react';
import { ChallengeSidebar } from './ChallengeSidebar';
import { faGlobe } from '@fortawesome/free-solid-svg-icons';
import { useWorkspaceActions, useWorkspaceState } from './WorkspaceModule';

export function RightSidebar() {
  const { setRightSidebarTab } = useWorkspaceActions();
  const { rightSidebarTab } = useWorkspaceState();
  return (
    <ChallengeSidebar
      tooltipPlace="left"
      onSelect={name => {
        if (rightSidebarTab === name) {
          setRightSidebarTab(null);
        } else {
          setRightSidebarTab(name);
        }
      }}
      items={[
        {
          name: 'preview',
          label: 'Preview',
          fa: faGlobe,
          current: rightSidebarTab === 'preview',
        },
      ]}
    />
  );
}
