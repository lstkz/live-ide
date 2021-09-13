import React from 'react';

export function createModuleContext<TState, TActions>() {
  const Context = React.createContext<{
    state: TState;
    actions: TActions;
    getState?: () => TState;
  }>(null!);

  const useContext = () => {
    const context = React.useContext(Context);
    if (!context) {
      throw new Error('Context is not set');
    }
    return context;
  };
  const Provider = (props: {
    state: TState;
    actions: TActions;
    children: React.ReactNode;
    getState?: () => TState;
  }) => {
    const { state, actions, getState, children } = props;
    return (
      <Context.Provider
        value={React.useMemo(
          () => ({
            state,
            actions,
            getState,
          }),
          [state, actions, getState]
        )}
      >
        {children}
      </Context.Provider>
    );
  };
  return [Provider, useContext] as const;
}
