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

export interface LibraryDefinition {
  name: string;
  types?: string;
  typesBundle?: string;
  source: string;
}

export interface AwsCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
}

export interface AwsUploadContentAuth {
  bucketName: string;
  credentials: AwsCredentials;
}

export type AppSocketMsg = { type: 'test'; payload: { userId: string } };

export interface NotificationSettings {
  newsletter: boolean;
}

export interface Workspace {
  id: string;
  items: WorkspaceNode[];
  s3Auth: WorkspaceS3Auth;
  libraries: LibraryDefinition[];
}

export interface WorkspaceNode {
  id: string;
  name: string;
  parentId?: string | null;
  hash: string;
  type: WorkspaceNodeType;
  isLocked?: boolean | null;
}

export interface WorkspaceS3Auth {
  bucketName: string;
  credentials: AwsCredentials;
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
