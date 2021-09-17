import React from 'react';
import { keyframes } from 'styled-components';
import tw, { styled } from 'twin.macro';
import { useEditorActions } from './EditorModule';

const blinkingEffect = keyframes`
   from, to {
    opacity: 0;
  }
  1% {
    opacity: 50;
  }
  50% {
    opacity: 50;
  }
  51% {
    opacity: 0;
  }
`;

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
  .myInlineDecoration {
    width: 4px;
    height: 4px;
  }
  .bg-green {
    background: green;
  }
  .bg-red {
    background: #dc2626;
    width: 1px;
    /* background: rgba(220, 38, 38, 0.5);
    background: rgba(254, 226, 226, 0.5);
    background: rgba(127, 29, 29, 0.5); */
  }
  .custom-cursor {
    background: #dc2626;
    width: 2px;
    height: 22px;
    position: absolute;
    bottom: 0;
    /* animation: ${blinkingEffect} 1s linear infinite; */
  }
  .username {
    bottom: 100%;
    position: absolute;
    background: #dc2626;
    border-radius: 4px;
    padding-left: 3px;
    padding-right: 3px;
    color: white;
    width: 22px;
    height: 22px;
    border: 3px solid #dc2626;
    background: #dc2626
      url(data:image/svg+xml;base64,PHN2ZyBhcmlhLWhpZGRlbj0idHJ1ZSIgZm9jdXNhYmxlPSJmYWxzZSIgZGF0YS1wcmVmaXg9ImZhcyIgZGF0YS1pY29uPSJjYXQiIHJvbGU9ImltZyIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgNTEyIDUxMiIgY2xhc3M9InN2Zy1pbmxpbmUtLWZhIGZhLWNhdCBmYS13LTE2Ij48cGF0aCBmaWxsPSJ3aGl0ZSIgZD0iTTI5MC41OSAxOTJjLTIwLjE4IDAtMTA2LjgyIDEuOTgtMTYyLjU5IDg1Ljk1VjE5MmMwLTUyLjk0LTQzLjA2LTk2LTk2LTk2LTE3LjY3IDAtMzIgMTQuMzMtMzIgMzJzMTQuMzMgMzIgMzIgMzJjMTcuNjQgMCAzMiAxNC4zNiAzMiAzMnYyNTZjMCAzNS4zIDI4LjcgNjQgNjQgNjRoMTc2YzguODQgMCAxNi03LjE2IDE2LTE2di0xNmMwLTE3LjY3LTE0LjMzLTMyLTMyLTMyaC0zMmwxMjgtOTZ2MTQ0YzAgOC44NCA3LjE2IDE2IDE2IDE2aDMyYzguODQgMCAxNi03LjE2IDE2LTE2VjI4OS44NmMtMTAuMjkgMi42Ny0yMC44OSA0LjU0LTMyIDQuNTQtNjEuODEgMC0xMTMuNTItNDQuMDUtMTI1LjQxLTEwMi40ek00NDggOTZoLTY0bC02NC02NHYxMzQuNGMwIDUzLjAyIDQyLjk4IDk2IDk2IDk2czk2LTQyLjk4IDk2LTk2VjMybC02NCA2NHptLTcyIDgwYy04Ljg0IDAtMTYtNy4xNi0xNi0xNnM3LjE2LTE2IDE2LTE2IDE2IDcuMTYgMTYgMTYtNy4xNiAxNi0xNiAxNnptODAgMGMtOC44NCAwLTE2LTcuMTYtMTYtMTZzNy4xNi0xNiAxNi0xNiAxNiA3LjE2IDE2IDE2LTcuMTYgMTYtMTYgMTZ6IiBjbGFzcz0iIj48L3BhdGg+PC9zdmc+)
      no-repeat center center;
  }
`;

interface EditorWrapperProps {
  ideNode: HTMLDivElement | null;
}

export function EditorWrapper(props: EditorWrapperProps) {
  const { ideNode } = props;
  const wrapperRef = React.useRef<HTMLDivElement>(null!);
  const { load } = useEditorActions();

  React.useEffect(() => {
    if (!ideNode) {
      return;
    }
    wrapperRef.current.append(ideNode);
    load(ideNode);
  }, [ideNode]);
  return <Wrapper ref={wrapperRef} style={{ height: '100%' }}></Wrapper>;
}
