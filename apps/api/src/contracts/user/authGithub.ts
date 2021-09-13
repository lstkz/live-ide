import { S } from 'schema';
import fetch from 'cross-fetch';
import { AuthData } from 'shared';
import { UserCollection } from '../../collections/User';
import { reportError } from '../../common/bugsnag';
import { exchangeCode, getUserData } from '../../common/github';
import { createContract, createRpcBinding } from '../../lib';
import { createUser, generateAuthData, uploadUserAvatar } from './_common';

export const authGithub = createContract('user.authGithub')
  .params('code')
  .schema({
    code: S.string(),
  })
  .returns<AuthData>()
  .fn(async code => {
    const accessToken = await exchangeCode(code);
    const githubData = await getUserData(accessToken);
    const githubUser = await UserCollection.findOne({
      githubId: githubData.id,
    });
    if (githubUser) {
      const user = await UserCollection.findOneOrThrow({
        githubId: githubData.id,
      });
      return generateAuthData(user);
    }
    const user = await createUser(
      {
        email: githubData.email,
        githubId: githubData.id,
        username: githubData.username,
        name: githubData.name,
      },
      true
    );
    if (githubData.avatar_url) {
      try {
        const img = await fetch(githubData.avatar_url).then(x =>
          x.arrayBuffer()
        );
        const id = await uploadUserAvatar(Buffer.from(img));
        user.avatarId = id;
        await UserCollection.update(user, ['avatarId']);
      } catch (e) {
        reportError({
          error: e,
          source: 'api',
          isHandled: true,
          data: { userId: user._id.toHexString() },
        });
      }
    }
    return generateAuthData(user);
  });

export const registerGithubRpc = createRpcBinding({
  public: true,
  signature: 'user.authGithub',
  handler: authGithub,
});
