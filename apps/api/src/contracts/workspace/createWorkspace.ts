import { S } from 'schema';
import { Workspace } from 'shared';
import { TemplateCollection } from '../../collections/Template';
import {
  WorkspaceCollection,
  WorkspaceModel,
} from '../../collections/Workspace';
import { AppError } from '../../common/errors';
import { randomString } from '../../common/helper';
import { mapWorkspace } from '../../common/mapper';
import { createWorkspaceNodes } from '../../common/workspace-tree';
import { createContract, createRpcBinding } from '../../lib';
import { resolve } from './resolve';

export const createWorkspace = createContract('workspace.createWorkspace')
  .params('user', 'templateId')
  .schema({
    user: S.object().appUser().optional(),
    templateId: S.string(),
  })
  .returns<Workspace>()
  .fn(async (user, templateId) => {
    const template = await TemplateCollection.findById(templateId);
    if (!template) {
      throw new AppError('Template not found');
    }
    const nodes = await createWorkspaceNodes(template.files);
    const pkg = template.files.find(
      node =>
        node.directory == '.' && node.name.toLowerCase() === 'package.json'
    );
    if (!pkg) {
      throw new Error('cannot find package.json');
    }
    const libraries = Object.entries(JSON.parse(pkg.content!).dependencies).map(
      ([name, version]) => name + '@' + version
    );
    const workspace: WorkspaceModel = {
      _id: template._id + '-' + randomString(12),
      accessKey: randomString(20),
      nodes,
      userId: user?._id,
      libraries,
      libraryUrl: await resolve(libraries).then(x => x.url),
    };
    await WorkspaceCollection.insertOne(workspace);
    return mapWorkspace(workspace);
  });

export const createWorkspaceRpc = createRpcBinding({
  injectUser: true,
  public: true,
  signature: 'workspace.createWorkspace',
  handler: createWorkspace,
});
