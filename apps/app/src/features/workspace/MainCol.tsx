import React from 'react';
import { EditorTabs } from './editor/EditorTabs';
import { EditorWrapper } from './editor/EditorWrapper';

interface MainColProps {
  ideNode: HTMLDivElement | null;
}

export function MainCol(props: MainColProps) {
  const { ideNode } = props;
  return (
    <div tw="h-full border-l border-gray-800 bg-editor-bg">
      <EditorTabs />
      <EditorWrapper ideNode={ideNode} />
    </div>
  );
}
