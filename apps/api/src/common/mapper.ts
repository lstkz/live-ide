import * as R from 'remeda';
import { UserModel } from '../collections/User';
import { User, Workspace } from 'shared';
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

export function mapWorkspace(workspace: WorkspaceModel): Workspace {
  return {
    ...R.pick(workspace, ['sourceBundles', 'typesBundles', 'libraries']),
    id: workspace._id,
    items: workspace.nodes.map(renameId),
  };
}
