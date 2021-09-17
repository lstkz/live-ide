import fetch from 'cross-fetch';

// IMPORTS
import { BundleResolution, AuthData, User, Workspace } from './types';
// IMPORTS END
import {
  WorkspaceNodeType,
  ParticipantCursor,
  ParticipantSelection,
} from './types';

export class APIClient {
  constructor(
    private baseUrl: string,
    public getToken: () => string | null,
    private agent?: any
  ) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  hasToken() {
    return this.getToken() != null;
  }

  // SIGNATURES
  dependency_resolve(libraries: string[]): Promise<BundleResolution> {
    return this.call('dependency.resolve', { libraries });
  }
  template_createTemplate(values: {
    id: string;
    name: string;
    files: { name: string; directory: string; content: string }[];
  }): Promise<void> {
    return this.call('template.createTemplate', { values });
  }
  user_authGithub(code: string): Promise<AuthData> {
    return this.call('user.authGithub', { code });
  }
  user_getMe(): Promise<User> {
    return this.call('user.getMe', {});
  }
  user_logout(): Promise<void> {
    return this.call('user.logout', {});
  }
  workspace_createWorkspace(templateId: string): Promise<Workspace> {
    return this.call('workspace.createWorkspace', { templateId });
  }
  workspace_createWorkspaceNode(values: {
    name: string;
    identityId: string;
    workspaceId: string;
    nodeId: string;
    type: WorkspaceNodeType;
    content?: string | null | undefined;
    parentId?: string | null | undefined;
  }): Promise<void> {
    return this.call('workspace.createWorkspaceNode', { values });
  }
  workspace_deleteWorkspaceNode(values: {
    identityId: string;
    workspaceId: string;
    nodeId: string;
  }): Promise<void> {
    return this.call('workspace.deleteWorkspaceNode', { values });
  }
  workspace_getWorkspace(id: string): Promise<Workspace> {
    return this.call('workspace.getWorkspace', { id });
  }
  workspace_resolve(libraries: string[]): Promise<{ url: string }> {
    return this.call('workspace.resolve', { libraries });
  }
  workspace_updateCursor(values: {
    identityId: string;
    workspaceId: string;
    order: number;
    cursor: ParticipantCursor | null;
  }): Promise<void> {
    return this.call('workspace.updateCursor', { values });
  }
  workspace_updateSelection(values: {
    identityId: string;
    workspaceId: string;
    order: number;
    selection: ParticipantSelection | null;
  }): Promise<void> {
    return this.call('workspace.updateSelection', { values });
  }
  workspace_updateWorkspaceNode(values: {
    identityId: string;
    workspaceId: string;
    nodeId: string;
    name?: string | undefined;
    content?: string | undefined;
  }): Promise<void> {
    return this.call('workspace.updateWorkspaceNode', { values });
  }
  // SIGNATURES END
  private async call(name: string, params: any): Promise<any> {
    const token = this.getToken();
    const headers: any = {
      'content-type': 'application/json',
    };
    if (token) {
      headers['authorization'] = token;
    }

    const res = await fetch(`${this.baseUrl}/rpc/${name}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(params),
      // @ts-ignore
      agent: this.agent,
    });
    const body = await res.json();
    if (res.status !== 200) {
      const err: any = new Error(body.error || 'Failed to call API');
      err.res = res;
      err.body = body;
      throw err;
    }
    return body;
  }
}
