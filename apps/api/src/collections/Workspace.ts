import { ObjectID } from 'mongodb2';
import { LibraryDefinition } from 'shared';
import { createCollection } from '../db';

export interface AwsCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
}

export interface WorkspaceS3Auth {
  bucketName: string;
  credentials: AwsCredentials;
  credentialsExpiresAt: Date;
}

export interface WorkspaceModel {
  _id: ObjectID;
  userId: ObjectID;
  challengeId: string;
  dedupKey?: string;
  isReady: boolean;
  s3Auth: WorkspaceS3Auth;
  libraries: LibraryDefinition[];
}

export const WorkspaceCollection = createCollection<WorkspaceModel>(
  'workspace',
  [
    {
      key: {
        userId: 1,
        challengeId: 1,
      },
    },
    {
      key: {
        dedupKey: 1,
      },
      unique: true,
      sparse: true,
    },
  ]
);
