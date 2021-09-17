import { S } from 'schema';
import { AccessTokenCollection } from '../../collections/AccessToken';
import { createContract, createRpcBinding } from '../../lib';

export const logout = createContract('user.logout')
  .params('user')
  .schema({
    user: S.object().appUser(),
  })
  .returns<void>()
  .fn(async user => {
    await AccessTokenCollection.deleteById(user.accessToken);
  });

export const loginGoogleRpc = createRpcBinding({
  injectUser: true,
  signature: 'user.logout',
  handler: logout,
});
