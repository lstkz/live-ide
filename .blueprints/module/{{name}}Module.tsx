import React from 'react';
import { useImmer, createModuleContext, useActions } from 'context-api';

interface Actions {
  test: () => void;
}
 
interface State {
  foo: boolean; 
}

const [Provider, useContext] = createModuleContext<State, Actions>();

export interface {{name}}Props {
  children: React.ReactNode;
}

export function {{name}}Module(props: {{name}}Props) {
  const { children } = props;
  const [state, setState, getState] = useImmer<State>({
    foo: false 
  },
    '{{name}}Module'
  );
  const actions = useActions<Actions>({
    test: () => {},
  });

  return ( 
    <Provider state={state} actions={actions}>
      {children}
    </Provider>
  );
}

export function use{{name}}Actions() {
  return useContext().actions;
}

export function use{{name}}State() {
  return useContext().state;
}
