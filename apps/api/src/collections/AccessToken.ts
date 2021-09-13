import { ObjectID } from 'mongodb';
import { createCollection } from '../db';

export interface AccessTokenModel {
  _id: string;
  userId: ObjectID;
}

export const AccessTokenCollection =
  createCollection<AccessTokenModel>('accessToken');
