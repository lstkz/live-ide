import { doFn, randomString } from '../../common/helper';
import jimp from 'jimp';
import { UserCollection, UserModel } from '../../collections/User';
import { ObjectID } from 'mongodb';
import { config } from 'config';
import { AppError, UnauthorizedError } from '../../common/errors';
import { AuthData } from 'shared';
import { mapUser } from '../../common/mapper';
import { createToken } from './createToken';
import { AppUser } from '../../types';
import { AccessTokenCollection } from '../../collections/AccessToken';
import { s3 } from '../../lib';

interface CreateUserValues {
  userId?: ObjectID;
  email: string;
  name?: string;
  username: string;
  githubId: number;
}

export async function createUser(values: CreateUserValues) {
  const userId = values.userId || new ObjectID();
  const user: UserModel = {
    _id: userId,
    email: values.email,
    username: values.username,
    githubId: values.githubId,
    name: values.name,
  };
  await UserCollection.insertOne(user);
  return user;
}

export async function generateAuthData(user: UserModel): Promise<AuthData> {
  return {
    user: mapUser(user),
    token: await createToken(user._id, null),
  };
}

export async function getAppUser(token: string): Promise<AppUser> {
  const tokenEntity = await AccessTokenCollection.findOne({
    _id: token,
  });
  if (!tokenEntity) {
    throw new UnauthorizedError('invalid token');
  }
  const ret = await UserCollection.findByIdOrThrow(tokenEntity.userId);
  return {
    ...ret,
    accessToken: token,
  };
}

export async function uploadUserAvatar(imgBuffer: Buffer) {
  const img = await jimp.read(imgBuffer).catch(() => {
    throw new AppError('Uploaded file is not a valid image');
  });
  if (img.bitmap.width !== img.bitmap.height) {
    throw new AppError('Image must be square');
  }
  const getPath = (size: string) => `cdn/avatars/${id}-${size}.png`;
  const id = randomString(20);
  await Promise.all([
    doFn(async () => {
      await s3
        .upload({
          Bucket: config.aws.s3Bucket,
          Key: getPath('org'),
          Body: await img.clone().getBufferAsync('image/png'),
        })
        .promise();
    }),
    doFn(async () => {
      await s3
        .upload({
          Bucket: config.aws.s3Bucket,
          Key: getPath('280x280'),
          Body: await img.clone().resize(280, 280).getBufferAsync('image/png'),
        })
        .promise();
    }),
    doFn(async () => {
      await s3
        .upload({
          Bucket: config.aws.s3Bucket,
          Key: getPath('80x80'),
          Body: await img.clone().resize(80, 80).getBufferAsync('image/png'),
        })
        .promise();
    }),
  ]);
  return id;
}
