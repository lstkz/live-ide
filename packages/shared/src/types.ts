export interface BundleData {
  code: string;
  css: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  isAdmin?: boolean | null;
  avatarId?: string | null;
}

export interface AuthData {
  user: User;
  token: string;
}

export type IframeMessage =
  | {
      type: 'inject';
      payload: { data: BundleData; importMap: Record<string, string> };
    }
  | {
      type: 'error';
      payload: { error: any };
    };

export type IframeCallbackMessage = {
  target: 'preview';
  type: 'hard-reload';
};

export type IframeNavigationMessage =
  | {
      target: 'navigation';
      type: 'navigate';
      payload: { url: string };
    }
  | {
      target: 'navigation';
      type: 'refresh';
    }
  | {
      target: 'navigation';
      type: 'go';
      payload: { diff: number };
    };

export type IframeNavigationCallbackMessage =
  | {
      target: 'navigation';
      type: 'navigated';
      payload: { url: string };
    }
  | {
      target: 'navigation';
      type: 'replaced';
      payload: { url: string };
    }
  | {
      target: 'navigation';
      type: 'did-go';
      payload: { diff: number };
    };

export interface AwsCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
}

export interface AwsUploadContentAuth {
  bucketName: string;
  credentials: AwsCredentials;
}

export interface CursorPosition {
  column: number;
  lineNumber: number;
}

export interface Selection {
  endColumn: number;
  endLineNumber: number;
  positionColumn: number;
  positionLineNumber: number;
  selectionStartColumn: number;
  selectionStartLineNumber: number;
  startColumn: number;
}

export interface CodeChange {
  forceMoveMarkers: boolean;
  range: {
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
  };
  rangeLength: number;
  rangeOffset: boolean;
}

export interface ParticipantCursor {
  nodeId: string;
  position: CursorPosition | null;
  secondaryPositions: CursorPosition[];
}
export interface ParticipantSelection {
  nodeId: string;
  selection: Selection | null;
  secondarySelections: Selection[];
}

export interface ParticipantInfo {
  identity: WorkspaceIdentity;
  cursor: ParticipantCursor | null;
  selection: ParticipantSelection | null;
}

export type WorkspaceUpdateType =
  | {
      type: 'node-added';
      payload: WorkspaceNode;
    }
  | {
      type: 'node-removed';
      payload: {
        id: string;
      };
    }
  | {
      type: 'node-updated';
      payload: {
        id: string;
        name: string;
      };
    }
  | {
      type: 'cursor-updated';
      payload: {
        fromId: string;
        cursor: ParticipantCursor | null;
      };
    }
  | {
      type: 'selection-updated';
      payload: {
        fromId: string;
        selection: ParticipantSelection | null;
      };
    }
  | {
      type: 'file-updated';
      payload: {
        fromSocketId: string;
        nodeId: string;
        changeId: string;
        changes: CodeChange[];
      };
    }
  | {
      type: 'participants-info';
      payload: {
        participants: ParticipantInfo[];
      };
    };

export type AppSocketMsg =
  | {
      type: 'test';
      payload: { socketId: string };
    }
  | {
      type: 'workspace-update';
      payload: {
        data: WorkspaceUpdateType;
        workspaceId: string;
        socketId: string;
        order: number;
      };
    };

export interface NotificationSettings {
  newsletter: boolean;
}

export interface Workspace {
  id: string;
  items: WorkspaceNode[];
  libraries: string[];
  sourceBundles: Bundle[];
  typesBundles: Bundle[];
}

export interface WorkspaceNode {
  id: string;
  name: string;
  content?: string | null;
  parentId: string | null;
  type: WorkspaceNodeType;
}

export enum WorkspaceNodeType {
  File = 'file',
  Directory = 'directory',
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
}

export type ExtractType<T> = T extends { type: infer S } ? S : never;

export interface Bundle {
  url: string;
  name: string;
  version: string;
}

export interface BundleResolution {
  sourceBundles: Bundle[];
  typesBundles: Bundle[];
}

export interface WorkspaceIdentity {
  id: string;
  workspaceId: string;
  name?: string;
  color: string;
  icon: string;
}
