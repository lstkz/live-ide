import React from 'react';
import { SpinnerBoarder } from 'src/components/SpinnerBoarder';
import { styled } from 'twin.macro';
import { useEditorActions, useEditorState } from './EditorModule';

const Wrapper = styled.div`
  .view-line {
    .mtk1,
    .mtk2,
    .mtk3,
    .mtk4,
    .mtk5,
    .mtk6,
    .mtk7,
    .mtk8,
    .mtk9,
    .mtk10,
    .mtk11,
    .mtk12,
    .mtk13,
    .mtk14,
    .mtk15,
    .mtk16,
    .mtk17,
    .mtk18,
    .mtk19,
    .mtk20,
    .mtk21,
    .mtk22,
    .mtk23,
    .mtk24,
    .mtk25 {
      color: #dcdcdc;
    }
  }
  .monaco-mouse-cursor-text {
    box-shadow: none;
  }
`;

interface EditorWrapperProps {
  ideNode: HTMLDivElement | null;
}

export function EditorWrapper(props: EditorWrapperProps) {
  const { ideNode } = props;
  const wrapperRef = React.useRef<HTMLDivElement>(null!);
  const { load } = useEditorActions();
  const { alert } = useEditorState();

  React.useEffect(() => {
    if (!ideNode) {
      return;
    }
    wrapperRef.current.append(ideNode);
    load(ideNode);
  }, [ideNode]);
  return (
    <div tw="relative" style={{ height: '100%' }}>
      {alert && (
        <div
          className="transform -translate-x-1/2"
          tw="rounded-md bg-blue-50 p-1 w-60 absolute z-20 left-1/2 top-0 "
        >
          <div tw="flex space-x-3 items-center justify-center ">
            <SpinnerBoarder size="sm" />
            <div tw="text-sm text-gray-700">{alert}</div>
          </div>
        </div>
      )}
      <Wrapper ref={wrapperRef} style={{ height: '100%' }}></Wrapper>
    </div>
  );
}
