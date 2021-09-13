import React from 'react';
import { gql } from '@apollo/client';
import { InferGetServerSidePropsType } from 'next'
import { useImmer } from 'context-api';
import {
  Get{{name}}Document,
  Get{{name}}Query,
} from '../../generated';
import { getApolloClient } from '../../getApolloClient';
import { createGetServerSideProps } from '../../common/helper'

type State = {
  foo: boolean; 
}

export function {{name}}Page(props: {{name}}SSRProps) {
  const { } = props;
  const [state, setState, getState] = useImmer<State>({
    foo: false 
  },
    '{{name}}Module'
  );
  return <div></div>
}

export type {{name}}SSRProps = InferGetServerSidePropsType<typeof getServerSideProps>;

gql`
  query Get{{name}} {
    ping
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
