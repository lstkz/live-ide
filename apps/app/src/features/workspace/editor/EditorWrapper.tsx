import React from 'react';
import { createUrl } from 'src/common/url';
import { Button } from 'src/components/Button';
import { useUser } from 'src/features/AuthModule';
import { saveAuthRedirect } from 'src/services/Storage';
import { styled } from 'twin.macro';
import { useEditorActions } from './EditorModule';

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
  const user = useUser();
  const wrapperRef = React.useRef<HTMLDivElement>(null!);
  const { load } = useEditorActions();

  React.useEffect(() => {
    if (!user || !ideNode) {
      return;
    }
    wrapperRef.current.append(ideNode);
    load(ideNode);
  }, [ideNode]);
  if (!user) {
    return (
      <div tw="text-white text-center py-12">
        <div>Create an account to start coding</div>
        <Button
          href={createUrl({ name: 'register' })}
          type="light"
          focusBg="editor-bg"
          tw="mx-auto mt-4"
          onClick={() => {
            saveAuthRedirect(location.pathname);
          }}
        >
          Create account
        </Button>
      </div>
    );
  }
  return <Wrapper ref={wrapperRef} style={{ height: '100%' }}></Wrapper>;
}
