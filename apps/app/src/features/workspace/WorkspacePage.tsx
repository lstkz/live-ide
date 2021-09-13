import React from 'react';
import { LeftCol } from './LeftCol';
import { WorkspaceHeader } from './WorkspaceHeader';
import { useWorkspaceActions, useWorkspaceState } from './WorkspaceModule';
import { MainCol } from './MainCol';
import { LeftSidebar } from './LeftSidebar';
import { RightSidebar } from './RightSidebar';
import { RightCol } from './RightCol';
import { LayoutManager } from './LayoutManager';
import { IS_SSR } from 'src/config';

export function WorkspacePage() {
  const {} = useWorkspaceActions();
  const {
    leftSidebarTab,
    rightSidebarTab,
    initialLeftSidebar,
    initialRightSidebar,
  } = useWorkspaceState();
  const [overflow, setOverflow] = React.useState<string | undefined>('hidden');
  React.useEffect(() => {
    const id = setTimeout(() => {
      setOverflow(undefined);
    }, 0);
    return () => {
      clearTimeout(id);
    };
  }, []);
  const [ideNode] = React.useState<HTMLDivElement>(() => {
    if (IS_SSR) {
      return null!;
    }
    const node = document.createElement('div');
    node.style.height = '100%';
    return node;
  });
  const height = `calc(100% - 2.5rem)`;
  return (
    <div tw="h-full flex flex-col">
      <WorkspaceHeader />
      <div tw="flex" style={{ height, overflow }}>
        <LeftSidebar />
        <LayoutManager
          initialLeftSidebar={initialLeftSidebar}
          initialRightSidebar={initialRightSidebar}
          left={<LeftCol />}
          hasLeft={leftSidebarTab != null}
          main={<MainCol ideNode={ideNode} />}
          right={<RightCol />}
          hasRight={rightSidebarTab != null}
        />
        <RightSidebar />
      </div>
    </div>
  );
}
