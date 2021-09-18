import { createModuleContext, useActions, useImmer } from 'context-api';
import React from 'react';
import { usePreventEditorNavigation } from './usePreventEditorNavigation';
import { APIService } from './APIService';
import { useModelState } from './useModelState';
import {
  IWorkspaceModel,
  TreeNode,
  BrowserPreviewService,
  EditorStateService,
  EditorFactory,
  EditorCreator,
} from 'code-editor';
import { IFRAME_ORIGIN } from 'src/config';
import {
  Workspace,
  WorkspaceIdentity,
  WorkspaceNode,
  WorkspaceNodeType,
} from 'shared';
import { MonacoLoader } from './MonacoLoader';
import { CollaborationSocket } from '../CollaborationSocket';
import { useErrorModalActions } from 'src/features/ErrorModalModule';

interface Actions {
  load: (container: HTMLDivElement) => void;
  registerPreviewIFrame: (iframe: HTMLIFrameElement) => void;
}

interface State {
  isLoaded: boolean;
  isSubmitting: boolean;
  workspace: Workspace;
  alert?: string | null;
}

interface FinalState extends State {
  workspaceModel: IWorkspaceModel;
}

const [Provider, useContext] = createModuleContext<FinalState, Actions>();

interface EditorModuleProps {
  identity: WorkspaceIdentity | null;
  children: React.ReactNode;
  workspace: Workspace;
  collaborationSocket: CollaborationSocket;
}

function useServices(
  collaborationSocket: CollaborationSocket,
  workspace: Workspace
) {
  return React.useMemo(() => {
    const apiService = new APIService('', workspace.id);
    const editorStateService = new EditorStateService(workspace.id);
    const browserPreviewService = new BrowserPreviewService(IFRAME_ORIGIN);
    const creator = new EditorCreator(
      apiService,
      browserPreviewService,
      editorStateService,
      collaborationSocket
    );
    const editorFactory = new EditorFactory();
    const monacoLoader = new MonacoLoader();
    return {
      editorFactory,
      monacoLoader,
      apiService,
      editorStateService,
      browserPreviewService,
      creator,
    };
  }, []);
}

function mapWorkspaceNodes(id: string, nodes: WorkspaceNode[]) {
  const ret: TreeNode[] = nodes.map(node => {
    if (node.type === WorkspaceNodeType.Directory) {
      return {
        type: 'directory',
        id: node.id,
        name: node.name,
        parentId: node.parentId,
      };
    } else {
      return {
        type: 'file',
        id: node.id,
        name: node.name,
        parentId: node.parentId,
        content: node.content!,
      };
    }
  });
  return ret;
}

export interface EditorModuleRef {
  openNewWorkspace: (newWorkspace: Workspace) => void;
}

export const EditorModule = React.forwardRef<
  EditorModuleRef,
  EditorModuleProps
>((props, _ref) => {
  const { children, identity, collaborationSocket } = props;
  const [state, setState, getState] = useImmer<State>(
    {
      isLoaded: false,
      isSubmitting: false,
      workspace: props.workspace,
      alert: '',
    },
    'EditorModule'
  );
  const {
    editorFactory,
    monacoLoader,
    browserPreviewService,
    creator,
    apiService,
  } = useServices(collaborationSocket, props.workspace);
  React.useEffect(() => {
    if (identity) {
      apiService.updateIdentityId(identity.id);
    }
  }, [identity]);
  const { workspaceModel, themeService } = creator;
  const loadedDefer = React.useMemo(() => {
    let resolve: () => void = null!;
    const promise = new Promise<void>(_resolve => {
      resolve = _resolve;
    });
    return {
      promise,
      resolve,
    };
  }, []);
  React.useEffect(() => {
    if (getState().isLoaded) {
      loadedDefer.resolve();
    }
  }, [state.isLoaded]);
  const { showError } = useErrorModalActions();

  const initWorkspace = (workspace: Workspace) => {
    return workspaceModel.init({
      defaultOpenFiles: ['./App.tsx', './App.jsx'],
      nodes: mapWorkspaceNodes(workspace.id, workspace.items),
      workspaceId: workspace.id,
      sourceBundles: workspace.sourceBundles,
      typesBundles: workspace.typesBundles,
      libraries: workspace.libraries,
      showAlert: (msg: string | null) => {
        setState(draft => {
          draft.alert = msg;
        });
      },
      showError: error => {
        showError(error, true);
      },
    });
  };

  const actions = useActions<Actions>({
    load: async container => {
      if (getState().isLoaded) {
        return;
      }
      const { workspace } = getState();
      await monacoLoader.init();
      const monaco = monacoLoader.getMonaco();
      editorFactory.init(monaco, container);
      themeService.init();
      creator.init(monaco, editorFactory.create());
      await browserPreviewService.waitForLoad();
      await initWorkspace(workspace);
      setState(draft => {
        draft.isLoaded = true;
      });
    },
    registerPreviewIFrame: iframe => {
      browserPreviewService.load(iframe);
    },
  });

  const { dirtyMap } = useModelState(workspaceModel.getModelState());
  usePreventEditorNavigation(dirtyMap);
  React.useEffect(() => {
    return () => {
      creator.dispose();
    };
  }, []);
  return (
    <Provider
      state={{
        ...state,
        workspaceModel,
      }}
      actions={actions}
    >
      {children}
    </Provider>
  );
});

export function useEditorActions() {
  return useContext().actions;
}

export function useEditorState() {
  return useContext().state;
}

export function useIsEditorLoaded() {
  return useEditorState().isLoaded;
}

export function useWorkspaceModel() {
  return useEditorState().workspaceModel;
}

export function useWorkspaceState() {
  return useModelState(useWorkspaceModel().getModelState());
}
