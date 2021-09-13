import React from 'react';

export function useGetter<T>(value: T) {
  const ref = React.useRef(value);
  ref.current = value;
  return React.useCallback(() => ref.current, []);
}
