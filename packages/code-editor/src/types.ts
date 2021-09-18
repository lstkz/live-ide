import type * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';
import {
  Bundle,
  CodeChange,
  CursorPosition,
  ParticipantCursor,
  ParticipantSelection,
  Selection,
  WorkspaceUpdateData,
} from 'shared';
import { ModelState } from './lib/ModelState';
export * from './editor-types';

export type Monaco = typeof monacoEditor;

export type NodeId = string;

export type NewElementType = 'file' | 'directory';

export interface AddNewElementValues {
  id: NodeId;
  type: NewElementType;
  name: string;
  parentId: string | null;
}

export type TreeNode = FileNode | DirectoryNode;

interface BaseNode {
  id: NodeId;
  name: string;
  parentId?: string | null;
}

export interface FileNode extends BaseNode {
  type: 'file';
  content?: string | null;
}

export interface DirectoryNode extends BaseNode {
  type: 'directory';
}

export type TreeNodeType = TreeNode['type'];

export type RecTreeNode = FileNode | RecDirectoryNode;

export interface RecDirectoryNode extends DirectoryNode {
  children: RecTreeNode[];
}

export type HighlighterAction = {
  type: 'highlight';
  payload: {
    lang: string;
    code: string;
    version: number;
  };
};

export type HighlighterCallbackAction = {
  type: 'highlight';
  payload: {
    classifications: Classification[];
    version: number;
  };
};

export type FormatterAction = {
  type: 'format';
  payload: {
    lang: string;
    code: string;
    version: number;
  };
};

export type FormatterCallbackAction =
  | {
      type: 'highlight';
      payload: {
        code: string;
        version: number;
      };
    }
  | {
      type: 'error';
      payload: {
        error: any;
        version: number;
      };
    };

export interface Classification {
  startLine: number;
  endLine: number;
  start: number;
  end: number;
  scope: string;
}

export interface SourceCode {
  code: string;
}

export interface BundlerAction {
  type: 'bundle';
  payload: {
    input: string;
    modules: Record<string, SourceCode>;
    version: number;
  };
}

export type BundlerCallbackAction =
  | {
      type: 'bundled';
      payload: {
        code: string;
        css: string;
        version: number;
      };
    }
  | {
      type: 'error';
      payload: {
        error: string;
        version: number;
      };
    };

export interface CreateWorkspaceNodeInput {
  id: string;
  workspaceId: string;
  name: string;
  parentId?: string | null;
  type: 'file' | 'directory';
}

export interface UpdateWorkspaceNodeInput {
  id: string;
  name?: string | null;
  parentId?: string | null;
}

export interface IAPIService {
  addNode(values: CreateWorkspaceNodeInput): Promise<void>;
  deleteNode(nodeId: string): Promise<void>;
  updateNode(
    values: UpdateWorkspaceNodeInput & { content?: string }
  ): Promise<void>;
  updateCursor(order: number, cursor: ParticipantCursor | null): Promise<void>;
  updateSelection(
    order: number,
    selection: ParticipantSelection | null
  ): Promise<void>;
  broadcastCodeChanges(
    nodeId: string,
    order: number,
    changes: CodeChange[]
  ): Promise<void>;
  updateLibraries(libraries: string[]): Promise<{
    libraries: string[];
    sourceBundles: Bundle[];
    typesBundles: Bundle[];
  }>;
}

export interface InitWorkspaceOptions {
  defaultOpenFiles: string[];
  workspaceId: string;
  nodes: TreeNode[];
  sourceBundles: Bundle[];
  typesBundles: Bundle[];
  libraries: string[];
  showAlert?: (msg: string | null) => void;
  showError?: (error: string | Error) => void;
}

export interface InitReadOnlyWorkspaceOptions {
  nodes: TreeNode[];
  defaultOpenFiles: string[];
}

export interface OpenedTab {
  id: string;
  name: string;
}

export interface WorkspaceState {
  activeTabId: string | null;
  nodes: TreeNode[];
  tabs: OpenedTab[];
  dirtyMap: Record<string, boolean>;
  nodeState: Record<string, 'error'>;
}

export interface IWorkspaceModel {
  getModelState(): ModelState<WorkspaceState>;
  removeNode(nodeId: string): Promise<void>;
  renameNode(nodeId: string, name: string): Promise<void>;
  openFile(id: string): void;
  closeFile(id: string): void;
  addNew(newNode: TreeNode): void;
}

export interface BundleData {
  code: string;
  css: string;
}

export interface CodeActionsCallbackMap {
  modified: (data: { fileId: string; hasChanges: boolean }) => void;
  saved: (data: { fileId: string; content: string }) => void;
  opened: (data: { fileId: string }) => void;
  errorsChanged: (data: { diffErrorMap: Record<string, boolean> }) => void;
  fileUpdated: (data: {
    fileId: string;
    order: number;
    changes: CodeChange[];
  }) => void;
  cursorUpdated: (
    data: {
      fileId: string;
      position: CursorPosition | null;
      secondaryPositions: CursorPosition[];
    } | null
  ) => void;
  selectionUpdated: (
    data: {
      fileId: string;
      selection: Selection | null;
      secondarySelections: Selection[];
    } | null
  ) => void;
}

type ExtractPayload<T> = T extends { payload: infer S } ? S : never;
type ExtractType<T> = T extends { type: infer S } ? S : never;
export type WorkspaceUpdateDataType = ExtractType<
  Pick<WorkspaceUpdateData, 'type'>
>;

export type ExtractWorkspaceUpdateData<T> = ExtractPayload<
  WorkspaceUpdateData extends { type: infer K }
    ? K extends T
      ? Pick<WorkspaceUpdateData, 'payload'>
      : never
    : never
>;

export interface CursorUpdatedData {
  fileId: string | null;
  identityId: string;
  cursorClassName: string;
  userClassName: string;
  position: CursorPosition | null;
  secondaryPositions: CursorPosition[];
}

export interface SelectionUpdatedData {
  fileId: string | null;
  identityId: string;
  className: string;
  selection: Selection | null;
  secondarySelections: Selection[];
}
export interface CodeChangesData {
  fileId: string;
  identityId: string;
  changes: CodeChange[];
}

export interface CollaborationSocketCallbackMap {
  cursorUpdated: (data: CursorUpdatedData) => void;
  selectionUpdated: (data: SelectionUpdatedData) => void;
  codeChanges: (data: CodeChangesData) => void;
  nodeAdded: (data: TreeNode) => void;
  nodeRemoved: (id: string) => void;
  nodeUpdated: (data: { id: string; name: string }) => void;
}

export interface ICollaborationSocket {
  addEventListener<T extends keyof CollaborationSocketCallbackMap>(
    type: T,
    callback: CollaborationSocketCallbackMap[T]
  ): () => void;
}
