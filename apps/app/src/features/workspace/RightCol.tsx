import React from 'react';
import { IFRAME_ORIGIN } from 'src/config';
import { useWorkspaceState } from './WorkspaceModule';
import { PreviewIframe } from './PreviewIframe';
import { WebNavigator } from './WebNavigator';

export function RightCol() {
  const { rightSidebarTab } = useWorkspaceState();
  const isDragging = false;
  return (
    <div
      tw="h-full flex flex-col"
      style={{
        pointerEvents: isDragging ? 'none' : undefined,
      }}
    >
      <WebNavigator
        name="PreviewNavigator"
        shallowHidden={rightSidebarTab !== 'preview'}
        origin={IFRAME_ORIGIN}
      >
        <PreviewIframe />
      </WebNavigator>
    </div>
  );
}
