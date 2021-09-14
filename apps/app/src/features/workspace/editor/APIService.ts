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
    throw new Error('TODO');
  }

  async deleteNode(nodeId: string) {
    throw new Error('TODO');
  }

  async updateNode(values: UpdateNodeValues & { content?: string }) {
    throw new Error('TODO');
  }
}
