import { S } from 'schema';
import { User } from 'shared';
import { mapUser } from '../../common/mapper';
import { createContract, createRpcBinding } from '../../lib';

export const getMe = createContract('user.getMe')
  .params('user')
  .schema({
    user: S.object().appUser(),
  })
  .returns<User>()
  .fn(async user => {
    return mapUser(user);
  });

export const getMeRpc = createRpcBinding({
  injectUser: true,
  signature: 'user.getMe',
  handler: getMe,
});
