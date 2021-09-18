import {
  CodeChange,
  ParticipantCursor,
  ParticipantSelection,
  WorkspaceNodeType,
} from 'shared';
import { api } from 'src/services/api';
import { IAPIService } from 'code-editor';

interface AddNodeValues {
  id: string;
  name: string;
  workspaceId: string;
  hash: string;
  type: WorkspaceNodeType;
  parentId?: string | null | undefined;
}

interface UpdateNodeValues {
  id: string;
  name?: string | null | undefined;
  parentId?: string | null | undefined;
  hash?: string | null | undefined;
}

export class APIService implements IAPIService {
  constructor(private identityId: string, private workspaceId: string) {}

  updateWorkspaceId(workspaceId: string) {
    this.workspaceId = workspaceId;
  }

  updateIdentityId(identityId: string) {
    this.identityId = identityId;
  }

  async addNode(values: AddNodeValues) {
    await api.workspace_createWorkspaceNode({
      identityId: this.identityId,
      workspaceId: this.workspaceId,
      name: values.name,
      nodeId: values.id,
      type: values.type,
      content: '',
      parentId: values.parentId,
    });
  }

  async deleteNode(nodeId: string) {
    await api.workspace_deleteWorkspaceNode({
      identityId: this.identityId,
      workspaceId: this.workspaceId,
      nodeId,
    });
  }

  async updateNode(values: UpdateNodeValues & { content?: string }) {
    await api.workspace_updateWorkspaceNode({
      identityId: this.identityId,
      workspaceId: this.workspaceId,
      nodeId: values.id,
      content: values.content,
      name: values.name ?? undefined,
    });
  }

  async updateCursor(order: number, cursor: ParticipantCursor | null) {
    await api.workspace_updateCursor({
      identityId: this.identityId,
      workspaceId: this.workspaceId,
      order,
      cursor,
    });
  }

  async updateSelection(order: number, selection: ParticipantSelection | null) {
    await api.workspace_updateSelection({
      identityId: this.identityId,
      workspaceId: this.workspaceId,
      order,
      selection,
    });
  }

  async broadcastCodeChanges(
    nodeId: string,
    order: number,
    changes: CodeChange[]
  ) {
    await api.workspace_broadcastCodeChanges({
      identityId: this.identityId,
      workspaceId: this.workspaceId,
      order,
      nodeId,
      changes,
    });
  }

  async updateLibraries(libraries: string[]) {
    return await api.workspace_updateLibraries(this.workspaceId, libraries);
  }
}
