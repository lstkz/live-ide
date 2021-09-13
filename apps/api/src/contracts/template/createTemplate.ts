import { S } from 'schema';
import * as R from 'remeda';
import { TemplateCollection } from '../../collections/Template';
import { createContract, createRpcBinding } from '../../lib';

export const createTemplate = createContract('template.createTemplate')
  .params('values')
  .schema({
    values: S.object().keys({
      id: S.string(),
      name: S.string(),
      files: S.array().items(
        S.object().keys({
          name: S.string(),
          directory: S.string(),
          content: S.string(),
        })
      ),
    }),
  })
  .returns<void>()
  .fn(async values => {
    await TemplateCollection.findOneAndUpdate(
      {
        _id: values.id,
      },
      {
        $set: {
          ...R.omit(values, ['id']),
        },
      },
      {
        upsert: true,
      }
    );
  });

export const createTemplateRpc = createRpcBinding({
  admin: true,
  signature: 'template.createTemplate',
  handler: createTemplate,
});
