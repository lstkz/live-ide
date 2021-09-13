import { S } from 'schema';
import {
  AccessTokenCollection,
  AccessTokenModel,
} from '../../collections/AccessToken';
import { randomUniqString } from '../../common/helper';
import { createContract } from '../../lib';

export const createToken = createContract('user.createToken')
  .params('userId', 'fixedToken')
  .schema({
    userId: S.string().objectId(),
    fixedToken: S.string().nullable().optional(),
  })
  .returns<string>()
  .fn(async (userId, fixedToken) => {
    const token: AccessTokenModel = {
      _id: fixedToken ?? randomUniqString(),
      userId: userId,
    };
    await AccessTokenCollection.insertOne(token);
    return token._id;
  });
