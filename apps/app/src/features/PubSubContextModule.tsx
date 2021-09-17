import { createModuleContext } from 'context-api';
import React from 'react';

export type PubSubActions = {
  type: 'sample';
  payload: {};
};

interface Actions {
  dispatch: (action: PubSubActions) => void;
  addListener: (type: string, fn: (payload: any) => void) => () => void;
}

interface State {}

interface PubSubModuleProps {
  children: React.ReactNode;
}

const [Provider, useContext] = createModuleContext<State, Actions>();

interface Handler {
  type: string;
  fn: (payload: any) => void;
}

export function PubSubContextModule(props: PubSubModuleProps) {
  const { children } = props;
  const handlersRef = React.useRef<Handler[]>([]);

  const actions: Actions = {
    dispatch: action => {
      for (const handler of handlersRef.current) {
        if (handler.type === action.type) {
          handler.fn(action.payload);
        }
      }
    },
    addListener: (type, fn) => {
      const handler = { type, fn };
      handlersRef.current.push(handler);
      return () => {
        handlersRef.current.splice(handlersRef.current.indexOf(handler), 1);
      };
    },
  };

  return (
    <Provider state={{}} actions={actions}>
      {children}
    </Provider>
  );
}

type ExtractPayload<T> = T extends { payload: infer U } ? U : never;
type ExtractTypes<T> = T extends { type: infer U } ? U : never;

interface UseSubActionOptions<T extends PubSubActions> {
  action: ExtractTypes<T>;
  fn: (payload: ExtractPayload<T>) => void;
}

export function useSubAction<T extends PubSubActions>(
  options: UseSubActionOptions<T>
) {
  const { action, fn } = options;
  const { actions } = useContext();
  React.useEffect(() => {
    return actions.addListener(action, fn);
  }, [action, fn]);
}

export function usePub() {
  const { actions } = useContext();
  return actions.dispatch;
}
