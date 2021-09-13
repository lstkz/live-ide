import * as R from 'remeda';
import S3 from 'aws-sdk/clients/s3';
import { doFn } from 'src/common/helper';
import { WorkspaceNodeType, WorkspaceS3Auth } from 'shared';
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
  private s3: S3 = null!;
  private bucketName: string = null!;

  constructor(private workspaceId: string, auth: WorkspaceS3Auth) {
    this.s3 = new S3({
      credentials: auth.credentials,
      region: 'eu-central-1',
    });
    this.bucketName = auth.bucketName;
  }

  updateAuth(auth: WorkspaceS3Auth) {
    this.s3 = new S3({
      credentials: auth.credentials,
      region: 'eu-central-1',
    });
  }
  updateWorkspaceId(workspaceId: string) {
    this.workspaceId = workspaceId;
  }

  async getFileContent(contentUrl: string, hash?: string) {
    let url = contentUrl;
    if (hash) {
      url += `?h=${hash}`;
    }
    return fetch(url).then(x => x.text());
  }

  async addNode(values: AddNodeValues) {
    await api.workspace_createWorkspaceNode(values);
  }

  async deleteNode(nodeId: string) {
    await Promise.all([
      this.s3.deleteObject({
        Bucket: this.bucketName,
        Key: this._getS3Key(nodeId),
      }),
      api.workspace_deleteWorkspaceNode(nodeId),
    ]);
  }

  async updateNode(values: UpdateNodeValues & { content?: string }) {
    await Promise.all([
      doFn(async () => {
        if (values.content) {
          await this.s3
            .upload({
              Bucket: this.bucketName,
              Key: this._getS3Key(values.id),
              Body: values.content,
            })
            .promise();
        }
      }),
      doFn(async () => {
        const other = R.omit(values, ['content']);
        if (Object.values(other).length > 1) {
          await api.workspace_updateWorkspaceNode(other);
        }
      }),
    ]);
  }

  async uploadIndexFile(html: string) {
    const key = this._getS3Key('bundle/' + R.randomString(20));
    await this.s3
      .upload({
        Bucket: this.bucketName,
        Key: key,
        Body: html,
      })
      .promise();
    return key;
  }

  private _getS3Key(fileId: string) {
    return `cdn/workspace/${this.workspaceId}/${fileId}`;
  }
}
