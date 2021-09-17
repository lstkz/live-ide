import React from 'react';
import { gql } from '@apollo/client';
import { InferGetServerSidePropsType } from 'next'
import { useImmer, createModuleContext, useActions } from 'context-api';
import {
  Get{{name}}Document,
  Get{{name}}Query,
} from '../../generated';
import { getApolloClient } from '../../getApolloClient';
import { {{name}}Page } from './{{name}}Page';
import { createGetServerSideProps } from '../../common/helper'

interface Actions {
  test: () => void;
}
 
interface State {
  foo: boolean; 
}

const [Provider, useContext] = createModuleContext<State, Actions>();
 
export function {{name}}Module(props: {{name}}SSRProps) {
  const { } = props;
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
      <{{name}}Page />
    </Provider>
  );
}

export function use{{name}}Actions() {
  return useContext().actions;
}

export function use{{name}}State() {
  return useContext().state;
}


export type {{name}}SSRProps = InferGetServerSidePropsType<typeof getServerSideProps>;

gql`
  query Get{{name}} {
    allTodos {
      todoId
    }
  }
`;

export const getServerSideProps = createGetServerSideProps(async ctx => {
  const client = getApolloClient(ctx);
  const ret = await client.query<Get{{name}}Query>({
    query: Get{{name}}Document,
  });
  return {
    props: ret.data,
  };
});
