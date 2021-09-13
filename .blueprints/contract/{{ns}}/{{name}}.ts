import { S } from 'schema';
import { createContract, createRpcBinding } from '../../lib';


export const {{name}} = createContract('{{ns}}.{{name}}')
  .params('user', 'values')
  .schema({
    user: S.object().appUser(),
    values: S.object().keys({
    })
  })
  .returns<void>()
  .fn(async (user, values) => {

  });

export const {{name}}Rpc = createRpcBinding({
  injectUser: true,
  signature: '{{ns}}.{{name}}',
  handler: {{name}},
});
