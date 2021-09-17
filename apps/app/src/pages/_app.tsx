import '../styles/globals.css';
import '../styles/vs-code-annotations.css';
import { AppContext, AppProps } from 'next/app';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import React from 'react';
import { AuthModule } from 'src/features/AuthModule';
import { ErrorModalModule } from 'src/features/ErrorModalModule';
import { clearAccessToken, getAccessToken } from 'src/services/Storage';
import { User } from 'shared';
import { createSSRClient } from 'src/common/helper';
import { PubSubContextModule } from 'src/features/PubSubContextModule';
import { ErrorBoundary } from 'src/bug-report';

config.autoAddCss = false;

interface GlobalProps {
  initialUser: User | null;
}

export default function App({
  Component,
  initialUser,
  pageProps,
}: AppProps & GlobalProps) {
  React.useEffect(() => {
    if (!initialUser && getAccessToken()) {
      clearAccessToken();
    }
  }, []);
  return (
    <ErrorBoundary>
      <PubSubContextModule>
        <AuthModule initialUser={initialUser}>
          <ErrorModalModule>
            <Component {...pageProps} />
          </ErrorModalModule>
        </AuthModule>
      </PubSubContextModule>
      <div id="portals" />
    </ErrorBoundary>
  );
}

App.getInitialProps = async ({ ctx }: AppContext) => {
  const api = createSSRClient(ctx);
  if (!api.getToken()) {
    return { initialUser: null };
  }
  const user = await api.user_getMe().catch(e => {
    console.error(e);
    return null;
  });
  return {
    initialUser: user,
  };
};
