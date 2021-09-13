import { combineObject } from '../src/combineObject';

it('should combine', () => {
  expect(combineObject(['a', 'b', 'c'], [1, 2, 3])).toEqual({
    a: 1,
    b: 2,
    c: 3,
  });
});
it('should combine empty', () => {
  expect(combineObject([], [])).toEqual({});
});
