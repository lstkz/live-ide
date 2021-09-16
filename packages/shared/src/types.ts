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

export type AppSocketMsg = { type: 'test'; payload: { userId: string } };

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
