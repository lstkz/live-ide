import { serializeObject } from '../src/serializeObject';
import { ContractConfig } from '../src/types';

const globalConfig: ContractConfig = {
  removeFields: ['password', 'token', 'accessToken'],
  debug: true,
  depth: 4,
  maxArrayLength: 30,
  debugEnter: () => {
    //
  },
  debugExit: () => {
    //
  },
};

it('serialize undefined', () => {
  expect(serializeObject(globalConfig, undefined)).toMatchInlineSnapshot(
    `"undefined"`
  );
});
it('serialize null', () => {
  expect(serializeObject(globalConfig, null)).toMatchInlineSnapshot(`"null"`);
});
it('serialize example object', () => {
  expect(
    serializeObject(globalConfig, { foo: 'a', bar: 123 })
  ).toMatchInlineSnapshot(`"{ foo: 'a', bar: 123 }"`);
});
it('circular', () => {
  const obj: any = { foo: 'a', bar: 123 };
  obj.obj = obj;
  expect(serializeObject(globalConfig, obj)).toMatchInlineSnapshot(
    `"{ foo: 'a', bar: 123, obj: '[Circular]' }"`
  );
});
it('many items', () => {
  const obj = {
    longArray: new Array(400),
  };
  expect(serializeObject(globalConfig, obj)).toMatchInlineSnapshot(
    `"{ longArray: 'Array(400)' }"`
  );
});
