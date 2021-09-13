import { UserModel } from '../collections/User';
import { WorkspaceS3Auth } from '../collections/Workspace';
import { User, WorkspaceS3Auth as MappedWorkspaceS3Auth } from 'shared';

export function mapUser(user: UserModel): User {
  return {
    id: user._id.toHexString(),
    email: user.email,
    username: user.username,
    isAdmin: user.isAdmin,
    avatarId: user.avatarId,
  };
}

export function mapWorkspaceS3Auth(
  auth: WorkspaceS3Auth
): MappedWorkspaceS3Auth {
  return {
    bucketName: auth.bucketName,
    credentials: auth.credentials,
  };
}
