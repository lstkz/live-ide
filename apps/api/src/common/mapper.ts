import { UserModel } from '../collections/User';
import { User } from 'shared';
import { WorkspaceModel } from '../collections/Workspace';
import { renameId } from './helper';

export function mapUser(user: UserModel): User {
  return {
    id: user._id.toHexString(),
    email: user.email,
    username: user.username,
    isAdmin: user.isAdmin,
    avatarId: user.avatarId,
  };
}

export function mapWorkspace(workspace: WorkspaceModel) {
  return {
    id: workspace._id,
    items: workspace.nodes.map(renameId),
    libraryUrl: workspace.libraryUrl,
    libraries: workspace.libraries,
    accessKey: workspace.accessKey,
  };
}
