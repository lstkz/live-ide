import React from 'react';
import { ModelState } from 'code-editor';

export function useModelState<T>(modelState: ModelState<T>) {
  const [, forceRender] = React.useState(0);
  React.useEffect(() => {
    return modelState.addEventListener('updated', () => {
      forceRender(x => x + 1);
    });
  });
  return modelState.state;
}
