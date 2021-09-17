import type * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';
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
