import React from 'react';

export function useActions<T>(actions: T) {
  return React.useMemo<T>(() => actions, []);
}
