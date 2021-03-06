import React from 'react';
import { InferGetServerSidePropsType } from 'next';
import { useImmer, createModuleContext, useActions } from 'context-api';
import { WorkspacePage } from './WorkspacePage';
import { createGetServerSideProps, createSSRClient } from '../../common/helper';
import { readCookieFromString } from '../../common/cookie';
import {
  LEFT_COOKIE_NAME,
  LEFT_DEFAULT,
  RIGHT_COOKIE_NAME,
  RIGHT_DEFAULT,
} from './const';
import { EditorModule, EditorModuleRef } from './editor/EditorModule';
import { Workspace, WorkspaceIdentity } from 'shared';
import { getIdentity } from './identity';
import { MainWorkspaceSocket } from './WorkspaceSocket';
import { CollaborationSocket } from './CollaborationSocket';

interface Actions {
  setLeftSidebarTab: (leftSidebarTab: LeftSidebarTab | null) => void;
  setRightSidebarTab: (rightSidebarTab: RightSidebarTab | null) => void;
}

interface State {
  identity: WorkspaceIdentity;
  otherParticipants: WorkspaceIdentity[];
  workspace: Workspace;
  initialLeftSidebar: number;
  initialRightSidebar: number;
  leftSidebarTab: LeftSidebarTab | null;
  rightSidebarTab: RightSidebarTab | null;
}

export type LeftSidebarTab = 'file-explorer';

export type RightSidebarTab = 'preview';

const [Provider, useContext] = createModuleContext<State, Actions>();

export function WorkspaceModule(props: WorkspaceSSRProps) {
  return <WorkspaceModuleInner key="todo" {...props} />;
}

function WorkspaceModuleInner(props: WorkspaceSSRProps) {
  const { initialLeftSidebar, initialRightSidebar, workspace } = props;
  const [state, setState] = useImmer<State>(
    {
      identity: null!,
      otherParticipants: [],
      workspace,
      initialLeftSidebar,
      initialRightSidebar,
      leftSidebarTab: 'file-explorer',
      rightSidebarTab: 'preview',
    },
    'WorkspaceModule'
  );
  const editorRef = React.useRef<EditorModuleRef>(null!);
  const actions = useActions<Actions>({
    setLeftSidebarTab: leftSidebarTab => {
      setState(draft => {
        draft.leftSidebarTab = leftSidebarTab;
      });
    },
    setRightSidebarTab: rightSidebarTab => {
      setState(draft => {
        draft.rightSidebarTab = rightSidebarTab;
      });
    },
  });
  const workspaceSocket = React.useMemo(
    () => new MainWorkspaceSocket(workspace.id),
    [workspace.id]
  );
  const collaborationSocket = React.useMemo(
    () => new CollaborationSocket(workspaceSocket),
    [workspaceSocket]
  );

  React.useEffect(() => {
    const identity = getIdentity(workspace.id);
    setState(draft => {
      draft.identity = identity;
    });
    workspaceSocket.addEventListener(
      'participants-info',
      ({ participants }) => {
        setState(draft => {
          draft.otherParticipants = participants.map(x => x.identity);
        });
      }
    );
    workspaceSocket.start(identity);
    return () => {
      workspaceSocket.disconnect();
    };
  }, [workspaceSocket]);

  return (
    <Provider state={state} actions={actions}>
      <EditorModule
        workspace={workspace}
        identity={state.identity}
        collaborationSocket={collaborationSocket}
        ref={editorRef}
      >
        <WorkspacePage />
      </EditorModule>
    </Provider>
  );
}

export function useWorkspaceActions() {
  return useContext().actions;
}

export function useWorkspaceState() {
  return useContext().state;
}

export type WorkspaceSSRProps = InferGetServerSidePropsType<
  typeof getServerSideProps
>;

export const getServerSideProps = createGetServerSideProps(async ctx => {
  const getCookieNum = (name: string, defaultValue: number) => {
    const strVal = readCookieFromString(
      ctx?.req?.headers['cookie'] ?? '',
      name
    );
    const val = strVal ? Number(strVal) : null;
    return val || defaultValue;
  };
  const initialLeftSidebar = getCookieNum(LEFT_COOKIE_NAME, LEFT_DEFAULT);
  const initialRightSidebar = getCookieNum(RIGHT_COOKIE_NAME, RIGHT_DEFAULT);
  const api = createSSRClient(ctx);
  const id = ctx.query.id as string;
  const workspace = await api.workspace_getWorkspace(id);
  return {
    props: {
      workspace,
      initialLeftSidebar,
      initialRightSidebar,
    },
  };
});
