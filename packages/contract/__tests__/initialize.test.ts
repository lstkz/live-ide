import { S } from 'schema';
import { initialize, ContractError } from '../src';

describe('validation', () => {
  it('single function', async () => {
    expect.assertions(4);

    const { createContract } = initialize({
      debug: false,
    });
    const fn = await createContract('myService#fn')
      .params('a')
      .schema({
        a: S.number().min(0),
      })
      .fn(async a => a + 10);
    await expect(fn(10)).resolves.toBe(20);
    try {
      await fn(-10);
    } catch (e) {
      expect(e).toBeInstanceOf(ContractError);
      expect((e as ContractError).message).toMatchInlineSnapshot(
        `"ContractError: Validation error: 'a' must be greater or equal to 0."`
      );
      expect((e as ContractError).entries).toMatchInlineSnapshot(`
Array [
  Object {
    "input": "{ a: -10 }",
    "signature": "myService#fn",
  },
]
`);
    }
  });

  it('nested function', async () => {
    expect.assertions(4);

    const { createContract } = initialize({
      debug: false,
    });
    const fn1 = await createContract('myService#fn1')
      .params('a')
      .schema({
        a: S.number().min(0),
      })
      .fn(async a => a + 10);

    const fn2 = await createContract('myService#fn2')
      .params('a')
      .schema({
        a: S.number(),
      })
      .fn(async a => (await fn1(a + 1)) * 2);

    await expect(fn2(10)).resolves.toBe(42);
    try {
      await fn2(-10);
    } catch (e) {
      expect(e).toBeInstanceOf(ContractError);
      expect((e as ContractError).message).toMatchInlineSnapshot(
        `"ContractError: Validation error: 'a' must be greater or equal to 0."`
      );
      expect((e as ContractError).entries).toMatchInlineSnapshot(`
Array [
  Object {
    "input": "{ a: -10 }",
    "signature": "myService#fn2",
  },
  Object {
    "input": "{ a: -9 }",
    "signature": "myService#fn1",
  },
]
`);
    }
  });
});

describe('debugging', () => {
  it('simple input', async () => {
    const debugEnter = jest.fn();
    const debugExit = jest.fn();
    const { createContract } = initialize({
      debugEnter,
      debugExit,
    });
    const fn = await createContract('myService#fn')
      .params('a')
      .schema({
        a: S.number().min(0),
      })
      .fn(async a => a + 10);
    await fn(1);
    expect(debugEnter.mock.calls).toMatchInlineSnapshot(`
Array [
  Array [
    "myService#fn",
    "{ a: 1 }",
  ],
]
`);
    expect(debugExit.mock.calls).toMatchInlineSnapshot(`
Array [
  Array [
    "myService#fn",
    "11",
  ],
]
`);
  });

  it('with remove output', async () => {
    const debugEnter = jest.fn();
    const debugExit = jest.fn();
    const { createContract } = initialize({
      debugEnter,
      debugExit,
    });
    const fn = await createContract('myService#fn')
      .options({ removeOutput: true })
      .params('a')
      .schema({
        a: S.number().min(0),
      })
      .fn(async a => a + 10);
    await fn(1);
    expect(debugEnter.mock.calls).toMatchInlineSnapshot(`
Array [
  Array [
    "myService#fn",
    "{ a: 1 }",
  ],
]
`);
    expect(debugExit.mock.calls).toMatchInlineSnapshot(`
Array [
  Array [
    "myService#fn",
    "<removed>",
  ],
]
`);
  });

  it('serialize input', async () => {
    const debugEnter = jest.fn();
    const debugExit = jest.fn();
    const { createContract } = initialize({
      removeFields: ['password', 'token', 'accessToken'],
      debug: true,
      depth: 3,
      maxArrayLength: 3,
      debugEnter,
      debugExit,
    });
    const fn = await createContract('myService#fn')
      .params('a')
      .schema({
        a: S.object(),
      })
      .fn(async _ => ({
        foo: 2,
        password: 'a',
        arr3: [1, 2, 3, 4],
        arr4: [1, 2],
        a2: {
          b: {
            c: {
              d: { e: 1 },
            },
          },
        },
      }));
    await fn({
      foo: 1,
      token: 'a',
      arr1: [1, 2, 3, 4],
      arr2: [1, 2],
      a: {
        b: {
          c: {
            d: { e: 1 },
          },
        },
      },
    });
    expect(debugEnter.mock.calls).toMatchInlineSnapshot(`
Array [
  Array [
    "myService#fn",
    "{ a:
   { foo: 1,
     token: '<removed>',
     arr1: 'Array(4)',
     arr2: [ 1, 2 ],
     a: { b: { c: [Object] } } } }",
  ],
]
`);
    expect(debugExit.mock.calls).toMatchInlineSnapshot(`
Array [
  Array [
    "myService#fn",
    "{ foo: 2,
  password: '<removed>',
  arr3: 'Array(4)',
  arr4: [ 1, 2 ],
  a2: { b: { c: { d: [Object] } } } }",
  ],
]
`);
  });
});

interface Context {
  foo: string;
}

describe('context', () => {
  it('throw error if context is not set', async () => {
    const { createContract, getContext } = initialize<Context>({
      debug: false,
    });
    const fn = await createContract('myService#fn')
      .params()
      .fn(async () => {
        const context = getContext();
        return context.foo;
      });

    await expect(fn()).rejects.toThrowErrorMatchingInlineSnapshot(
      `"ContractError: Context is not set"`
    );
  });

  it('access context', async () => {
    const { createContract, getContext, runWithContext } = initialize<Context>({
      debug: false,
    });
    const fn = await createContract('myService#fn')
      .params()
      .fn(async () => {
        const context = getContext();
        return context.foo;
      });
    await runWithContext(
      {
        foo: 'bar',
      },
      async () => {
        await expect(fn()).resolves.toEqual('bar');
      }
    );
  });

  it('access context in nested contract', async () => {
    expect.assertions(1);
    const { createContract, getContext, runWithContext } = initialize<Context>({
      debug: false,
    });
    const fn1 = await createContract('myService#fn1')
      .params()
      .fn(async () => {
        const context = getContext();
        return context.foo;
      });
    const fn2 = await createContract('myService#fn2')
      .params()
      .fn(async () => {
        return new Promise(resolve =>
          setTimeout(() => {
            resolve(fn1());
          }, 0)
        );
      });
    await runWithContext(
      {
        foo: 'bar',
      },
      async () => {
        await expect(fn2()).resolves.toEqual('bar');
      }
    );
  });
});
