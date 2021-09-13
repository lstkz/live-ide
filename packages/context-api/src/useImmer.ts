import React from 'react';
import produce, { Draft } from 'immer';
export type { WritableDraft } from 'immer/dist/types/types-external';

export type SetState<T> = (f: (draft: Draft<T>) => void | T) => void;

export function useImmer<S = any>(
  initialValue: S | (() => S),
  logName?: string
): [S, (f: (draft: Draft<S>) => void | S) => void, () => S];

export function useImmer(initialValue: any, logName?: string) {
  const [state, setState] = React.useState(initialValue);
  const ref = React.useRef(state);
  ref.current = state;
  const canLog =
    logName &&
    process.env.NODE_ENV === 'development' &&
    typeof window !== 'undefined';
  const getState = React.useCallback(() => ref.current, []);
  if (canLog) {
    // eslint-disable-next-line no-console
    console.log(logName, state);
  }
  return [
    state,
    React.useCallback(updater => {
      const prevState = getState();
      const newState = produce(prevState, updater);
      setState(newState);
      ref.current = newState;
      if (canLog) {
        // eslint-disable-next-line no-console
        console.log(logName, newState);
      }
    }, []),
    getState,
  ] as const;
}
