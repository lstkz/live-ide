import { WorkspaceNodeType } from 'shared';
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
  constructor(private workspaceId: string) {}

  updateWorkspaceId(workspaceId: string) {
    this.workspaceId = workspaceId;
  }

  async addNode(values: AddNodeValues) {
    await api.workspace_createWorkspaceNode({
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
      workspaceId: this.workspaceId,
      nodeId,
    });
  }

  async updateNode(values: UpdateNodeValues & { content?: string }) {
    await api.workspace_updateWorkspaceNode({
      workspaceId: this.workspaceId,
      nodeId: values.id,
      content: values.content,
      name: values.name ?? undefined,
    });
  }
}
