import React from 'react';
import { DependencyList, EffectCallback } from 'react';
import { IS_SSR } from '../config';

export function useLayoutEffectFix(
  effect: EffectCallback,
  deps?: DependencyList
) {
  if (!IS_SSR) {
    React.useLayoutEffect(effect, deps);
  }
}
