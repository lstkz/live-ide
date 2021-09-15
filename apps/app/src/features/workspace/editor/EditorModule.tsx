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
import { Workspace, WorkspaceNode, WorkspaceNodeType } from 'shared';
import { MonacoLoader } from './MonacoLoader';

interface Actions {
  load: (container: HTMLDivElement) => void;
  registerPreviewIFrame: (iframe: HTMLIFrameElement) => void;
}

interface State {
  isLoaded: boolean;
  isSubmitting: boolean;
  workspace: Workspace;
}

interface FinalState extends State {
  workspaceModel: IWorkspaceModel;
}

const [Provider, useContext] = createModuleContext<FinalState, Actions>();

interface EditorModuleProps {
  children: React.ReactNode;
  workspace: Workspace;
}

function useServices(workspace: Workspace) {
  return React.useMemo(() => {
    const apiService = new APIService(workspace.id);
    const editorStateService = new EditorStateService(workspace.id);
    const browserPreviewService = new BrowserPreviewService(IFRAME_ORIGIN);
    const creator = new EditorCreator(
      apiService,
      browserPreviewService,
      editorStateService
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
        content: node.content,
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
>((props, ref) => {
  const { children } = props;
  const [state, setState, getState] = useImmer<State>(
    {
      isLoaded: false,
      isSubmitting: false,
      workspace: props.workspace,
    },
    'EditorModule'
  );
  const { editorFactory, monacoLoader, browserPreviewService, creator } =
    useServices(props.workspace);
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

  const initWorkspace = (workspace: Workspace) => {
    return workspaceModel.init({
      // defaultOpenFiles: ['./App.tsx'],
      defaultOpenFiles: [],
      nodes: mapWorkspaceNodes(workspace.id, workspace.items),
      workspaceId: workspace.id,
      sourceBundles: workspace.sourceBundles,
      typesBundles: workspace.typesBundles,
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
      await Promise.all(
        workspace.typesBundles.map(bundle =>
          creator.modelCollection.addLibBundle(bundle.name, bundle.url)
        )
      );

      await browserPreviewService.waitForLoad();
      // browserPreviewService.setLibraries(workspace.libraries);
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
