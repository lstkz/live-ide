import { ObjectID } from 'mongodb';
import { createCollection } from '../db';

export interface NotificationSettings {
  newsletter: boolean;
}

export interface UserModel {
  _id: ObjectID;
  email: string;
  username: string;
  name?: string;
  isAdmin?: boolean;
  avatarId?: string | null;
  githubId: number;
}

export const UserCollection = createCollection<UserModel>('user', [
  {
    key: {
      githubId: 1,
    },
    unique: true,
  },
]);
