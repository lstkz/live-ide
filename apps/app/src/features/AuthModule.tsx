import React from 'react';
import { useImmer, createModuleContext, useActions } from 'context-api';
import { useRouter } from 'next/dist/client/router';
import { createUrl } from 'src/common/url';
import { api } from 'src/services/api';
import { AuthData, User } from 'shared';
import { clearAccessToken, setAccessToken } from 'src/services/Storage';

interface Actions {
  logout: () => void;
  loginUser: (data: AuthData, redirectUrl?: string | false) => void;
  updateUser: (values: Partial<User>) => void;
}

interface State {
  user: User | null;
}

const [Provider, useContext] = createModuleContext<State, Actions>();

export interface AuthProps {
  children: React.ReactNode;
  initialUser: User | null;
}

export function AuthModule(props: AuthProps) {
  const { children, initialUser } = props;
  const [state, setState] = useImmer<State>(
    {
      user: initialUser,
    },
    'AuthModule'
  );
  const router = useRouter();
  const actions = useActions<Actions>({
    logout: () => {
      void api
        .user_logout()
        .catch(() => {})
        .then(() => {
          clearAccessToken();
          return router.push('/');
        });
    },
    loginUser: (data, redirectUrl) => {
      setAccessToken(data.token);
      setState(draft => {
        draft.user = data.user;
      });
      if (redirectUrl !== false) {
        void router.push(redirectUrl ?? createUrl({ name: 'modules' }));
      }
    },
    updateUser: values => {
      setState(draft => {
        Object.assign(draft.user, values);
      });
    },
  });

  return (
    <Provider state={state} actions={actions}>
      {children}
    </Provider>
  );
}

export function useAuthActions() {
  return useContext().actions;
}

export function useAuthState() {
  return useContext().state;
}
export function useUser() {
  return useAuthState().user!;
}
